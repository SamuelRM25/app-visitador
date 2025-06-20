package com.example.medicalvisitcontrol.ui.warehouse

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.PopupMenu
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.medicalvisitcontrol.R
import com.example.medicalvisitcontrol.data.models.Medication

class MedicationAdapter(
    private var medications: MutableList<Medication>,
    private val onItemEditClick: (Medication) -> Unit,
    private val onItemDeleteClick: (Medication) -> Unit
) : RecyclerView.Adapter<MedicationAdapter.MedicationViewHolder>() {

    fun updateMedications(newMedications: MutableList<Medication>) {
        this.medications = newMedications
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MedicationViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_medication, parent, false)
        return MedicationViewHolder(view)
    }

    override fun onBindViewHolder(holder: MedicationViewHolder, position: Int) {
        val medication = medications[position]
        holder.bind(medication)
    }

    override fun getItemCount(): Int = medications.size

    inner class MedicationViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvName: TextView = itemView.findViewById(R.id.tv_medication_name)
        private val tvMolecule: TextView = itemView.findViewById(R.id.tv_medication_molecule)
        private val tvPresentation: TextView = itemView.findViewById(R.id.tv_medication_presentation)
        private val tvPrice: TextView = itemView.findViewById(R.id.tv_medication_price)
        private val tvStock: TextView = itemView.findViewById(R.id.tv_medication_stock)
        private val tvNotes: TextView = itemView.findViewById(R.id.tv_medication_notes)
        private val btnOptions: ImageView = itemView.findViewById(R.id.btn_medication_options)

        fun bind(medication: Medication) {
            tvName.text = medication.name
            tvMolecule.text = "Molécula: ${medication.molecule}"
            tvPresentation.text = "Presentación: ${medication.presentation}"
            tvPrice.text = "Precio: $${String.format("%.2f", medication.price)}"
            tvStock.text = "Stock: ${medication.stock} unidades"
            tvNotes.text = if (medication.notes.isNullOrEmpty()) "Notas: N/A" else "Notas: ${medication.notes}"
            tvNotes.visibility = if (medication.notes.isNullOrEmpty()) View.GONE else View.VISIBLE

            btnOptions.setOnClickListener {
                val popup = PopupMenu(itemView.context, btnOptions)
                popup.menuInflater.inflate(R.menu.medication_options_menu, popup.menu)
                popup.setOnMenuItemClickListener { menuItem ->
                    when (menuItem.itemId) {
                        R.id.action_edit_medication -> {
                            onItemEditClick(medication)
                            true
                        }
                        R.id.action_delete_medication -> {
                            onItemDeleteClick(medication)
                            true
                        }
                        else -> false
                    }
                }
                popup.show()
            }
        }
    }
}