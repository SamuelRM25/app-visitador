package com.example.medicalvisitcontrol.ui.medicalvisits

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import android.widget.ImageView
import android.widget.PopupMenu
import android.widget.TextView
import androidx.lifecycle.LifecycleOwner // Importar LifecycleOwner
import androidx.lifecycle.lifecycleScope // Importar lifecycleScope
import androidx.recyclerview.widget.RecyclerView
import com.example.medicalvisitcontrol.R
import com.example.medicalvisitcontrol.data.dao.MedicationDao // Importar MedicationDao
import com.example.medicalvisitcontrol.data.models.DoctorPharmacy
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

class DoctorPharmacyAdapter(
    var doctors: MutableList<DoctorPharmacy>, // Lista mutable (se cambió a 'var' para permitir acceso externo)
    private val medicationDao: MedicationDao, // DAO de medicamentos para buscar nombres
    private val lifecycleOwner: LifecycleOwner, // ¡Nuevo! Pasa el LifecycleOwner
    private val onItemClick: (DoctorPharmacy) -> Unit,
    private val onItemEditClick: (DoctorPharmacy) -> Unit, // Nuevo: Lambda para editar
    private val onItemDeleteClick: (DoctorPharmacy) -> Unit, // Lambda para manejar la eliminación
    private val onVisitedStatusChange: (DoctorPharmacy, Boolean) -> Unit // Nuevo: Lambda para cambiar el estado de visita
) : RecyclerView.Adapter<DoctorPharmacyAdapter.DoctorPharmacyViewHolder>() {

    // Método para actualizar la lista de doctors que se muestra (usado por el filtro)
    fun updateDoctors(newDoctors: MutableList<DoctorPharmacy>) {
        this.doctors = newDoctors
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DoctorPharmacyViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_doctor_pharmacy, parent, false)
        return DoctorPharmacyViewHolder(view)
    }

    override fun onBindViewHolder(holder: DoctorPharmacyViewHolder, position: Int) {
        val doctor = doctors[position]
        holder.bind(doctor)
    }

    override fun getItemCount(): Int = doctors.size

    inner class DoctorPharmacyViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val doctorName: TextView = itemView.findViewById(R.id.doctor_name)
        private val doctorLocation: TextView = itemView.findViewById(R.id.doctor_location)
        private val doctorPhone: TextView = itemView.findViewById(R.id.doctor_phone)
        private val doctorBuys: TextView = itemView.findViewById(R.id.doctor_buys)
        private val iconMaps: ImageView = itemView.findViewById(R.id.icon_maps)
        private val btnOptions: ImageView = itemView.findViewById(R.id.btn_doctor_options)
        private val tvOrderedMedications: TextView = itemView.findViewById(R.id.tv_ordered_medications)
        private val tvOutstandingBalance: TextView = itemView.findViewById(R.id.tv_outstanding_balance)
        private val checkboxVisited: CheckBox = itemView.findViewById(R.id.checkbox_visited) // Nuevo CheckBox

        fun bind(doctor: DoctorPharmacy) {
            doctorName.text = doctor.name
            doctorLocation.text = doctor.location
            doctorPhone.text = doctor.phoneNumber
            doctorBuys.text = if (doctor.buys) "Compra: Sí" else "Compra: No"
            doctorBuys.setTextColor(if (doctor.buys) itemView.context.resources.getColor(R.color.green_500, null) else itemView.context.resources.getColor(R.color.red_500, null))

            // Mostrar el saldo pendiente
            tvOutstandingBalance.text = String.format(Locale.getDefault(), "Pendiente: Q%.2f", doctor.outstandingBalance)
            tvOutstandingBalance.visibility = View.VISIBLE

            // Configurar el CheckBox de visitado
            checkboxVisited.isChecked = doctor.isVisited
            checkboxVisited.text = if (doctor.isVisited) "Visitado" else "No Visitado"
            checkboxVisited.setTextColor(if (doctor.isVisited) itemView.context.resources.getColor(R.color.blue_500, null) else itemView.context.resources.getColor(R.color.grey_500, null))
            checkboxVisited.setOnCheckedChangeListener { _, isChecked ->
                onVisitedStatusChange(doctor, isChecked)
            }


            // Observar los medicamentos pedidos por este doctor y actualizar el TextView
            if (doctor.orderedItems.isNotEmpty()) {
                lifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
                    val medicationsInDb = medicationDao.getAllMedications().value
                    val displayString = doctor.orderedItems.mapNotNull { orderItem ->
                        val med = medicationsInDb?.find { it.id == orderItem.medicationId }
                        med?.let { "${it.name} (x${orderItem.quantity} @Q${String.format("%.2f", orderItem.customPrice)})" }
                    }.joinToString(", ")

                    withContext(Dispatchers.Main) {
                        tvOrderedMedications.text = "Pedidos: $displayString"
                        tvOrderedMedications.visibility = View.VISIBLE
                    }
                }
            } else {
                tvOrderedMedications.text = "Pedidos: Ninguno"
                tvOrderedMedications.visibility = View.VISIBLE
            }


            iconMaps.setOnClickListener {
                onItemClick(doctor)
            }

            btnOptions.setOnClickListener {
                val popup = PopupMenu(itemView.context, btnOptions)
                popup.menuInflater.inflate(R.menu.doctor_options_menu, popup.menu)
                popup.setOnMenuItemClickListener { menuItem ->
                    when (menuItem.itemId) {
                        R.id.action_edit_doctor -> {
                            onItemEditClick(doctor)
                            true
                        }
                        R.id.action_delete_doctor -> {
                            onItemDeleteClick(doctor)
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