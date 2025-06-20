package com.example.medicalvisitcontrol.ui.dashboard

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.medicalvisitcontrol.R
import com.example.medicalvisitcontrol.data.models.DoctorPharmacy
import com.example.medicalvisitcontrol.data.models.Gira // Corrected Gochira to Gira

// Data class para envolver el DoctorPharmacy y su Gira asociada para los resultados de búsqueda
data class SearchResultItem(
    val gira: Gira, // Corrected Gochira to Gira
    val doctor: DoctorPharmacy
)

class GlobalClientSearchAdapter(
    private var items: MutableList<SearchResultItem>,
    private val onItemClick: (Gira, DoctorPharmacy) -> Unit
) : RecyclerView.Adapter<GlobalClientSearchAdapter.ClientSearchViewHolder>() {

    fun updateList(newItems: MutableList<SearchResultItem>) {
        this.items = newItems
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ClientSearchViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_global_client_search_result, parent, false)
        return ClientSearchViewHolder(view)
    }

    override fun onBindViewHolder(holder: ClientSearchViewHolder, position: Int) {
        val item = items[position]
        holder.bind(item)
    }

    override fun getItemCount(): Int = items.size

    inner class ClientSearchViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvClientName: TextView = itemView.findViewById(R.id.tv_search_result_client_name)
        private val tvClientLocation: TextView = itemView.findViewById(R.id.tv_search_result_client_location)
        private val tvGiraName: TextView = itemView.findViewById(R.id.tv_search_result_gira_name)

        fun bind(item: SearchResultItem) {
            tvClientName.text = item.doctor.name
            tvClientLocation.text = item.doctor.location
            tvGiraName.text = "Gira: ${item.gira.name}"

            itemView.setOnClickListener {
                onItemClick(item.gira, item.doctor)
            }
        }
    }
}