package com.example.medicalvisitcontrol.ui.medicalvisits

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.medicalvisitcontrol.R
import com.example.medicalvisitcontrol.data.database.AppDatabase
import com.example.medicalvisitcontrol.data.models.Medication
import com.example.medicalvisitcontrol.data.models.OrderItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.ArrayList
import android.view.View // Importar View
import android.widget.EditText // Importar EditText
import java.io.Serializable // Importar Serializable

class MedicationPickerActivity : AppCompatActivity() {

    private lateinit var recyclerViewMedications: RecyclerView
    private lateinit var adapter: SelectableMedicationAdapter
    private lateinit var btnConfirmSelection: Button
    private lateinit var tvNoMedications: TextView

    private lateinit var database: AppDatabase
    private val TAG = "MedicationPickerAct"

    // Lista mutable para mantener los OrderItems seleccionados
    private val currentSelectedOrderItems: MutableList<OrderItem> = mutableListOf()
    private var allMedications: List<Medication> = emptyList() // Para tener acceso a los precios de stock

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_medication_picker)

        // Inicializar la base de datos
        database = AppDatabase.getDatabase(this)

        recyclerViewMedications = findViewById(R.id.recycler_view_medications_picker)
        btnConfirmSelection = findViewById(R.id.btn_confirm_medication_selection)
        tvNoMedications = findViewById(R.id.tv_no_medications_picker)

        // Recuperar OrderItems ya seleccionados si vienen del intent
        intent.getSerializableExtra("initial_selected_order_items")?.let { items ->
            currentSelectedOrderItems.addAll(items as Collection<OrderItem>)
        }

        recyclerViewMedications.layoutManager = LinearLayoutManager(this)

        // Observar los medicamentos de la base de datos y luego inicializar el adaptador
        database.medicationDao().getAllMedications().observe(this) { medications ->
            allMedications = medications // Guardar la lista completa de medicamentos
            // Inicializar o actualizar el adaptador
            adapter = SelectableMedicationAdapter(
                allMedications.toMutableList(), // Pasar todos los medicamentos
                currentSelectedOrderItems, // Pasar los OrderItems ya seleccionados
                onQuantityChanged = { medication, quantity, customPrice ->
                    // Buscar si ya existe un OrderItem para este medicamento
                    val existingItem = currentSelectedOrderItems.find { it.medicationId == medication.id }
                    if (existingItem != null) {
                        if (quantity > 0) {
                            existingItem.quantity = quantity
                            existingItem.customPrice = customPrice
                        } else {
                            currentSelectedOrderItems.remove(existingItem)
                        }
                    } else if (quantity > 0) {
                        currentSelectedOrderItems.add(OrderItem(medication.id, quantity, customPrice))
                    }
                    Log.d(TAG, "Selected Order Items: $currentSelectedOrderItems")
                }
            )
            recyclerViewMedications.adapter = adapter
            updateNoMedicationsVisibility(medications.isEmpty())
            Log.d(TAG, "Medicamentos cargados para selección: ${medications.size}")
        }


        btnConfirmSelection.setOnClickListener {
            // Devolver los OrderItems seleccionados y sus nombres para visualización
            val resultIntent = Intent().apply {
                putExtra("selected_order_items", ArrayList(currentSelectedOrderItems))

                // También devolver los nombres de los medicamentos para facilitar la visualización en el diálogo
                MainScope().launch(Dispatchers.IO) {
                    val selectedMedicationNames = currentSelectedOrderItems.mapNotNull { orderItem ->
                        val med = allMedications.find { it.id == orderItem.medicationId }
                        med?.name
                    }
                    putStringArrayListExtra("selected_medication_names", ArrayList(selectedMedicationNames))
                    withContext(Dispatchers.Main) {
                        setResult(Activity.RESULT_OK, this@apply)
                        finish()
                    }
                }
            }
        }
    }

    private fun updateNoMedicationsVisibility(isEmpty: Boolean) {
        if (isEmpty) {
            tvNoMedications.visibility = View.VISIBLE
            recyclerViewMedications.visibility = View.GONE
        } else {
            tvNoMedications.visibility = View.GONE
            recyclerViewMedications.visibility = View.VISIBLE
        }
    }
}