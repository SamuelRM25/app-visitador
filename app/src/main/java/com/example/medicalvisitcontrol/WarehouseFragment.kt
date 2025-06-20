package com.example.medicalvisitcontrol.ui.warehouse

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup // ¡CORREGIDO: era ViewGroupf, ahora es ViewGroup!
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.medicalvisitcontrol.R
import com.example.medicalvisitcontrol.data.database.AppDatabase // Importar AppDatabase
import com.example.medicalvisitcontrol.data.models.Medication
import com.google.android.material.floatingactionbutton.FloatingActionButton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID

class WarehouseFragment : Fragment() {

    private lateinit var recyclerViewMedications: RecyclerView
    private lateinit var medicationAdapter: MedicationAdapter
    private lateinit var fabAddMedication: FloatingActionButton
    private lateinit var tvNoMedications: TextView

    private lateinit var database: AppDatabase // Instancia de la base de datos
    private val TAG = "WarehouseFragment"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Inicializa la base de datos
        database = AppDatabase.getDatabase(requireContext())
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?, // Asegúrate de que sea ViewGroup
        savedInstanceState: Bundle?
    ): View? {
        try {
            val view = inflater.inflate(R.layout.fragment_warehouse, container, false)

            recyclerViewMedications = view.findViewById(R.id.recycler_view_medications)
            fabAddMedication = view.findViewById(R.id.fab_add_medication)
            tvNoMedications = view.findViewById(R.id.tv_no_medications)

            recyclerViewMedications.layoutManager = LinearLayoutManager(context)

            medicationAdapter = MedicationAdapter(
                mutableListOf(), // Lista vacía inicial
                onItemEditClick = { medication ->
                    showAddEditMedicationDialog(medication)
                },
                onItemDeleteClick = { medication ->
                    confirmDeleteMedication(medication)
                }
            )
            recyclerViewMedications.adapter = medicationAdapter

            // Observa los cambios en la base de datos y actualiza el RecyclerView
            database.medicationDao().getAllMedications().observe(viewLifecycleOwner) { medications ->
                medicationAdapter.updateMedications(medications)
                updateNoMedicationsVisibility()
            }

            fabAddMedication.setOnClickListener {
                showAddEditMedicationDialog(null) // Pasa null para añadir nuevo medicamento
            }

            return view
        } catch (e: Exception) {
            Log.e(TAG, "Error en onCreateView de WarehouseFragment: ${e.message}", e)
            Toast.makeText(requireContext(), "Error al cargar la pantalla de Bodega. Revisa el Logcat.", Toast.LENGTH_LONG).show()
            return null // Retorna null para evitar más errores si la vista no se infló
        }
    }

    /**
     * Muestra un diálogo para agregar o editar un medicamento.
     * @param medication El medicamento a editar, o null si se va a agregar uno nuevo.
     */
    private fun showAddEditMedicationDialog(medication: Medication?) {
        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_add_edit_medication, null)
        // Cambiamos 'val' a 'var' para defensivamente evitar el error "Val cannot be reassigned"
        val etName = dialogView.findViewById<EditText>(R.id.et_medication_name)
        val etMolecule = dialogView.findViewById<EditText>(R.id.et_medication_molecule)
        val etPresentation = dialogView.findViewById<EditText>(R.id.et_medication_presentation)
        val etPrice = dialogView.findViewById<EditText>(R.id.et_medication_price)
        val etStock = dialogView.findViewById<EditText>(R.id.et_medication_stock)
        val etNotes = dialogView.findViewById<EditText>(R.id.et_medication_notes)

        val isEditing = medication != null
        if (isEditing) {
            etName.setText(medication?.name)
            etMolecule.setText(medication?.molecule)
            etPresentation.setText(medication?.presentation)
            etPrice.setText(medication?.price.toString())
            etStock.setText(medication?.stock.toString())
            etNotes.setText(medication?.notes)
        }

        AlertDialog.Builder(requireContext())
            .setTitle(if (isEditing) "Editar Medicamento" else "Agregar Nuevo Medicamento")
            .setView(dialogView)
            .setPositiveButton(if (isEditing) "Guardar Cambios" else "Agregar") { dialog, _ ->
                val name = etName.text.toString().trim()
                val molecule = etMolecule.text.toString().trim()
                val presentation = etPresentation.text.toString().trim()
                val price = etPrice.text.toString().toDoubleOrNull()
                val stock = etStock.text.toString().toIntOrNull()
                val notes = etNotes.text.toString().trim().ifEmpty { null } // Si está vacío, guardar como null

                if (name.isNotEmpty() && molecule.isNotEmpty() && presentation.isNotEmpty() &&
                    price != null && stock != null && price >= 0 && stock >= 0) {
                    lifecycleScope.launch(Dispatchers.IO) {
                        if (isEditing) {
                            medication?.apply {
                                this.name = name
                                this.molecule = molecule
                                this.presentation = presentation
                                this.price = price
                                this.stock = stock
                                this.notes = notes
                                database.medicationDao().updateMedication(this)
                            }
                            withContext(Dispatchers.Main) {
                                Toast.makeText(context, "Medicamento '${name}' actualizado.", Toast.LENGTH_SHORT).show()
                            }
                        } else {
                            val newMedication = Medication(UUID.randomUUID().toString(), name, molecule, presentation, price, stock, notes)
                            database.medicationDao().insertMedication(newMedication)
                            withContext(Dispatchers.Main) {
                                Toast.makeText(context, "Medicamento '${name}' agregado exitosamente.", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                } else {
                    Toast.makeText(context, "Por favor, complete todos los campos correctamente (precio y stock deben ser números válidos y no negativos).", Toast.LENGTH_LONG).show()
                }
                dialog.dismiss()
            }
            .setNegativeButton("Cancelar") { dialog, _ ->
                dialog.cancel()
            }
            .show()
    }

    /**
     * Muestra un diálogo de confirmación antes de eliminar un medicamento.
     */
    private fun confirmDeleteMedication(medication: Medication) {
        AlertDialog.Builder(requireContext())
            .setTitle("Confirmar Eliminación")
            .setMessage("¿Estás seguro de que quieres eliminar el medicamento '${medication.name}'? Esta acción no se puede deshacer.")
            .setPositiveButton("Eliminar") { dialog, _ ->
                lifecycleScope.launch(Dispatchers.IO) {
                    database.medicationDao().deleteMedication(medication)
                    withContext(Dispatchers.Main) {
                        Toast.makeText(context, "Medicamento '${medication.name}' eliminado.", Toast.LENGTH_SHORT).show()
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
     * Actualiza la visibilidad del TextView de "No hay medicamentos".
     */
    private fun updateNoMedicationsVisibility() {
        if (medicationAdapter.itemCount == 0) {
            tvNoMedications.visibility = View.VISIBLE
            recyclerViewMedications.visibility = View.GONE
        } else {
            tvNoMedications.visibility = View.GONE
            recyclerViewMedications.visibility = View.VISIBLE
        }
    }
}
