package com.example.medicalvisitcontrol.ui.medicalvisits

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.PopupMenu
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.medicalvisitcontrol.R
import com.example.medicalvisitcontrol.data.models.Gira

class GiraAdapter(
    private var giras: MutableList<Gira>, // Ahora es var para poder reasignar la lista
    private val onItemClick: (Gira) -> Unit,
    private val onItemEditClick: (Gira) -> Unit,
    private val onItemDeleteClick: (Gira) -> Unit
) : RecyclerView.Adapter<GiraAdapter.GiraViewHolder>() {

    // Nuevo método para actualizar la lista de giras desde LiveData
    fun updateGiras(newGiras: MutableList<Gira>) {
        this.giras = newGiras
        notifyDataSetChanged() // Notifica cambios a todo el conjunto de datos
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GiraViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_gira, parent, false)
        return GiraViewHolder(view)
    }

    override fun onBindViewHolder(holder: GiraViewHolder, position: Int) {
        val gira = giras[position]
        holder.bind(gira)
    }

    override fun getItemCount(): Int = giras.size

    inner class GiraViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val giraName: TextView = itemView.findViewById(R.id.gira_name)
        private val giraDescription: TextView = itemView.findViewById(R.id.gira_description)
        private val giraDoctorsCount: TextView = itemView.findViewById(R.id.gira_doctors_count)
        private val btnOptions: ImageView = itemView.findViewById(R.id.btn_gira_options)

        fun bind(gira: Gira) {
            giraName.text = gira.name
            giraDescription.text = gira.description
            giraDoctorsCount.text = "${gira.doctors.size} Médicos/Farmacias Asignados"

            itemView.setOnClickListener {
                onItemClick(gira)
            }

            btnOptions.setOnClickListener {
                val popup = PopupMenu(itemView.context, btnOptions)
                popup.menuInflater.inflate(R.menu.gira_options_menu, popup.menu)
                popup.setOnMenuItemClickListener { menuItem ->
                    when (menuItem.itemId) {
                        R.id.action_edit_gira -> {
                            onItemEditClick(gira)
                            true
                        }
                        R.id.action_delete_gira -> {
                            onItemDeleteClick(gira)
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