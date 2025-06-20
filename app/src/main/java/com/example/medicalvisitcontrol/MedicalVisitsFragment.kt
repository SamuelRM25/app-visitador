package com.example.medicalvisitcontrol.ui.medicalvisits

import android.os.Bundle
import android.util.Log // Importar Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope // Importar lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.medicalvisitcontrol.R
import com.example.medicalvisitcontrol.data.database.AppDatabase // Importar AppDatabase
import com.example.medicalvisitcontrol.data.models.DoctorPharmacy
import com.example.medicalvisitcontrol.data.models.Gira
import com.google.android.material.floatingactionbutton.FloatingActionButton
import kotlinx.coroutines.Dispatchers // Importar Dispatchers
import kotlinx.coroutines.launch // Importar launch
import kotlinx.coroutines.withContext // Importar withContext
import java.util.UUID // Para generar IDs únicos

class MedicalVisitsFragment : Fragment() {

    private lateinit var recyclerViewGiras: RecyclerView
    private lateinit var giraAdapter: GiraAdapter
    private lateinit var fabAddGira: FloatingActionButton // Botón para añadir gira
    private lateinit var tvNoGiras: TextView // TextView para "No hay giras"

    private lateinit var database: AppDatabase // Instancia de la base de datos
    private val TAG = "MedicalVisitsFragment"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        database = AppDatabase.getDatabase(requireContext()) // Inicializa la base de datos
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        try {
            val view = inflater.inflate(R.layout.fragment_medical_visits, container, false)

            recyclerViewGiras = view.findViewById(R.id.recycler_view_giras)
            fabAddGira = view.findViewById(R.id.fab_add_gira)
            tvNoGiras = view.findViewById(R.id.tv_no_giras)

            recyclerViewGiras.layoutManager = LinearLayoutManager(context)

            // Inicializa el adaptador con una lista vacía y callbacks para edición y eliminación
            giraAdapter = GiraAdapter(
                mutableListOf(), // Se pasa una lista vacía inicialmente
                onItemClick = { gira ->
                    val detailFragment = GiraDetailFragment.newInstance(gira)
                    parentFragmentManager.beginTransaction()
                        .replace(R.id.fragment_container, detailFragment)
                        .addToBackStack(null)
                        .commit()
                },
                onItemEditClick = { gira ->
                    showAddEditGiraDialog(gira)
                },
                onItemDeleteClick = { gira ->
                    confirmDeleteGira(gira)
                }
            )
            recyclerViewGiras.adapter = giraAdapter

            // Observa los cambios en la base de datos y actualiza el RecyclerView
            database.giraDao().getAllGiras().observe(viewLifecycleOwner) { giras ->
                giraAdapter.updateGiras(giras) // Método para actualizar la lista del adaptador
                updateNoGirasVisibility()
                Log.d(TAG, "Giras cargadas desde DB: ${giras.size}")
            }

            // Carga datos de ejemplo solo si la base de datos está vacía (una sola vez)
            lifecycleScope.launch(Dispatchers.IO) {
                // Obtener el valor actual de LiveData de forma segura en el hilo de IO
                val currentGiras = database.giraDao().getAllGiras().value
                if (currentGiras.isNullOrEmpty()) { // Verificar si está vacía

                }
            }

            // Configura el FAB para añadir una nueva gira
            fabAddGira.setOnClickListener {
                showAddEditGiraDialog(null) // Pasa null para indicar que es una nueva gira
            }

            return view
        } catch (e: Exception) {
            Log.e(TAG, "Error en onCreateView de MedicalVisitsFragment: ${e.message}", e)
            Toast.makeText(requireContext(), "Error al cargar la pantalla de Visitas Médicas. Revisa el Logcat.", Toast.LENGTH_LONG).show()
            return null // Retorna null para evitar más errores si la vista no se infló
        }
    }

    /**
     * Muestra un diálogo para agregar o editar una gira.
     * @param gira La gira a editar, o null si se va a agregar una nueva.
     */
    private fun showAddEditGiraDialog(gira: Gira?) {
        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_add_edit_gira, null)
        val etGiraName = dialogView.findViewById<EditText>(R.id.et_gira_name)
        val etGiraDescription = dialogView.findViewById<EditText>(R.id.et_gira_description)

        val isEditing = gira != null
        if (isEditing) {
            etGiraName.setText(gira?.name)
            etGiraDescription.setText(gira?.description)
        }

        AlertDialog.Builder(requireContext())
            .setTitle(if (isEditing) "Editar Gira" else "Agregar Nueva Gira")
            .setView(dialogView)
            .setPositiveButton(if (isEditing) "Guardar Cambios" else "Agregar") { dialog, _ ->
                val name = etGiraName.text.toString().trim()
                val description = etGiraDescription.text.toString().trim()

                if (name.isNotEmpty() && description.isNotEmpty()) {
                    lifecycleScope.launch(Dispatchers.IO) {
                        if (isEditing) {
                            gira?.apply {
                                this.name = name
                                this.description = description
                                database.giraDao().updateGira(this)
                            }
                            withContext(Dispatchers.Main) {
                                Toast.makeText(context, "Gira '${name}' actualizada.", Toast.LENGTH_SHORT).show()
                            }
                        } else {
                            val newGira = Gira(UUID.randomUUID().toString(), name, description)
                            database.giraDao().insertGira(newGira)
                            withContext(Dispatchers.Main) {
                                Toast.makeText(context, "Gira '${name}' agregada exitosamente.", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                } else {
                    Toast.makeText(context, "Por favor, complete todos los campos.", Toast.LENGTH_SHORT).show()
                }
                dialog.dismiss()
            }
            .setNegativeButton("Cancelar") { dialog, _ ->
                dialog.cancel()
            }
            .show()
    }

    /**
     * Muestra un diálogo de confirmación antes de eliminar una gira.
     */
    private fun confirmDeleteGira(gira: Gira) {
        AlertDialog.Builder(requireContext())
            .setTitle("Confirmar Eliminación")
            .setMessage("¿Estás seguro de que quieres eliminar la gira '${gira.name}'? Esta acción no se puede deshacer.")
            .setPositiveButton("Eliminar") { dialog, _ ->
                lifecycleScope.launch(Dispatchers.IO) {
                    database.giraDao().deleteGira(gira)
                    withContext(Dispatchers.Main) {
                        Toast.makeText(context, "Gira '${gira.name}' eliminada.", Toast.LENGTH_SHORT).show()
                    }
                }
                dialog.dismiss()
            }
            .setNegativeButton("Cancelar") { dialog, _ ->
                dialog.cancel()
            }
            .show()
    }

    /**
     * Actualiza la visibilidad del TextView de "No hay giras".
     */
    private fun updateNoGirasVisibility() {
        // Obtenemos la lista directamente del adaptador, que ya está actualizada por LiveData
        if (giraAdapter.itemCount == 0) {
            tvNoGiras.visibility = View.VISIBLE
            recyclerViewGiras.visibility = View.GONE
        } else {
            tvNoGiras.visibility = View.GONE
            recyclerViewGiras.visibility = View.VISIBLE
        }
    }
}