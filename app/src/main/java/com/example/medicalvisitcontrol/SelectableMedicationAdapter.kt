package com.example.medicalvisitcontrol.ui.medicalvisits

import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.medicalvisitcontrol.R
import com.example.medicalvisitcontrol.data.models.Medication
import com.example.medicalvisitcontrol.data.models.OrderItem // Importar OrderItem
import java.util.Locale

class SelectableMedicationAdapter(
    private var medications: MutableList<Medication>,
    private val selectedOrderItems: MutableList<OrderItem>, // Lista de OrderItem
    private val onQuantityChanged: (Medication, Int, Double) -> Unit // Callback con medicamento, cantidad, y precio
) : RecyclerView.Adapter<SelectableMedicationAdapter.MedicationViewHolder>() {

    fun updateMedications(newMedications: MutableList<Medication>) {
        this.medications = newMedications
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MedicationViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_selectable_medication, parent, false)
        return MedicationViewHolder(view)
    }

    override fun onBindViewHolder(holder: MedicationViewHolder, position: Int) {
        val medication = medications[position]
        holder.bind(medication)
    }

    override fun getItemCount(): Int = medications.size

    inner class MedicationViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvMedicationDetails: TextView = itemView.findViewById(R.id.tv_medication_details)
        private val etQuantity: EditText = itemView.findViewById(R.id.et_medication_quantity) // Nuevo EditText
        private val etCustomPrice: EditText = itemView.findViewById(R.id.et_medication_custom_price) // Nuevo EditText
        private val tvStock: TextView = itemView.findViewById(R.id.tv_medication_stock) // Nuevo TextView para mostrar stock

        fun bind(medication: Medication) {
            tvMedicationDetails.text = "${medication.name} (${medication.molecule}) - ${medication.presentation}"
            tvStock.text = "Stock: ${medication.stock}" // Mostrar stock

            // Buscar si ya existe un OrderItem para este medicamento y precargar los valores
            val existingOrderItem = selectedOrderItems.find { it.medicationId == medication.id }
            if (existingOrderItem != null) {
                etQuantity.setText(existingOrderItem.quantity.toString())
                etCustomPrice.setText(String.format(Locale.getDefault(), "%.2f", existingOrderItem.customPrice))
            } else {
                etQuantity.setText("")
                etCustomPrice.setText(String.format(Locale.getDefault(), "%.2f", medication.price)) // Precio por defecto
            }

            // Remover listeners anteriores para evitar llamadas duplicadas
            etQuantity.removeTextChangedListener(etQuantity.tag as? TextWatcher)
            etCustomPrice.removeTextChangedListener(etCustomPrice.tag as? TextWatcher)


            // Configurar listeners para la cantidad y el precio
            val quantityTextWatcher = object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
                override fun afterTextChanged(s: Editable?) {
                    val quantity = s.toString().toIntOrNull() ?: 0
                    val customPrice = etCustomPrice.text.toString().toDoubleOrNull() ?: medication.price
                    onQuantityChanged(medication, quantity, customPrice)
                }
            }

            val customPriceTextWatcher = object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
                override fun afterTextChanged(s: Editable?) {
                    val quantity = etQuantity.text.toString().toIntOrNull() ?: 0
                    val customPrice = s.toString().toDoubleOrNull() ?: medication.price
                    onQuantityChanged(medication, quantity, customPrice)
                }
            }

            etQuantity.addTextChangedListener(quantityTextWatcher)
            etCustomPrice.addTextChangedListener(customPriceTextWatcher)

            // Guardar los TextWatchers en el tag para poder removerlos
            etQuantity.tag = quantityTextWatcher
            etCustomPrice.tag = customPriceTextWatcher
        }
    }
}