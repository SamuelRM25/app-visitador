package com.example.medicalvisitcontrol.ui.dashboard

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.medicalvisitcontrol.R
import com.example.medicalvisitcontrol.data.database.AppDatabase
import com.example.medicalvisitcontrol.data.models.Gira
import com.example.medicalvisitcontrol.data.models.QuotaData
import com.example.medicalvisitcontrol.ui.medicalvisits.GiraDetailFragment
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale // Importar Locale

class DashboardFragment : Fragment() {

    private lateinit var database: AppDatabase
    private val TAG = "DashboardFragment"

    // UI elements
    private lateinit var tvOverallQuotaProgress: TextView
    private lateinit var progressBarOverallQuota: ProgressBar

    private lateinit var tvOrderQuotaObjective: TextView
    private lateinit var tvTotalOrdersValue: TextView
    private lateinit var tvRemainingOrderQuota: TextView
    private lateinit var progressBarOrder: ProgressBar
    private lateinit var tvOrderProgressPercentage: TextView

    private lateinit var tvCollectionQuotaObjective: TextView
    private lateinit var tvTotalCollectionsValue: TextView
    private lateinit var tvRemainingCollectionQuota: TextView
    private lateinit var progressBarCollection: ProgressBar
    private lateinit var tvCollectionProgressPercentage: TextView

    private lateinit var tvTotalOutstandingOrders: TextView
    private lateinit var tvGiraCount: TextView
    private lateinit var tvDoctorPharmacyCount: TextView
    private lateinit var tvMedicationCount: TextView
    private lateinit var tvLowStockMedications: TextView
    private lateinit var btnResetQuotas: Button
    private lateinit var btnGlobalClientSearch: Button

    // Lista para almacenar todos los clientes para la búsqueda global
    private var allClientsForSearch: MutableList<SearchResultItem> = mutableListOf()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        database = AppDatabase.getDatabase(requireContext())
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        try {
            val view = inflater.inflate(R.layout.fragment_dashboard, container, false)

            // Initialize UI elements
            tvOverallQuotaProgress = view.findViewById(R.id.tv_overall_quota_progress)
            progressBarOverallQuota = view.findViewById(R.id.progress_bar_overall_quota)

            tvOrderQuotaObjective = view.findViewById(R.id.tv_dash_order_quota_objective)
            tvTotalOrdersValue = view.findViewById(R.id.tv_dash_total_orders_value)
            tvRemainingOrderQuota = view.findViewById(R.id.tv_dash_remaining_order_quota)
            progressBarOrder = view.findViewById(R.id.progress_bar_dash_order)
            tvOrderProgressPercentage = view.findViewById(R.id.tv_dash_order_progress_percentage)

            tvCollectionQuotaObjective = view.findViewById(R.id.tv_dash_collection_quota_objective)
            tvTotalCollectionsValue = view.findViewById(R.id.tv_dash_total_collections_value)
            tvRemainingCollectionQuota = view.findViewById(R.id.tv_dash_remaining_collection_quota)
            progressBarCollection = view.findViewById(R.id.progress_bar_dash_collection)
            tvCollectionProgressPercentage = view.findViewById(R.id.tv_dash_collection_progress_percentage)

            tvTotalOutstandingOrders = view.findViewById(R.id.tv_dash_total_outstanding_orders)
            tvGiraCount = view.findViewById(R.id.tv_gira_count)
            tvDoctorPharmacyCount = view.findViewById(R.id.tv_doctor_pharmacy_count)
            tvMedicationCount = view.findViewById(R.id.tv_medication_count)
            tvLowStockMedications = view.findViewById(R.id.tv_low_stock_medications)
            btnResetQuotas = view.findViewById(R.id.btn_reset_quotas)
            btnGlobalClientSearch = view.findViewById(R.id.btn_global_client_search) // Corrected reference

            observeData()

            // Configurar el listener para el botón de Reiniciar Cuotas
            btnResetQuotas.setOnClickListener {
                confirmResetQuotas()
            }

            // Configurar el listener para el botón de Búsqueda Global de Clientes
            btnGlobalClientSearch.setOnClickListener {
                showGlobalClientSearchDialog()
            }

            return view
        } catch (e: Exception) {
            Log.e(TAG, "Error en onCreateView de DashboardFragment: ${e.message}", e)
            Toast.makeText(requireContext(), "Error al cargar el Dashboard. Revisa el Logcat.", Toast.LENGTH_LONG).show()
            return null
        }
    }

    /**
     * Observa los datos de la base de datos y actualiza la UI.
     */
    private fun observeData() {
        // Observa los datos de cuotas
        database.quotaDao().getQuotaData().observe(viewLifecycleOwner) { quotaData ->
            quotaData?.let {
                // Cuota de Pedidos
                tvOrderQuotaObjective.text = String.format(Locale.getDefault(), "Cuota Pedidos: Q%.2f", it.orderQuota)
                tvTotalOrdersValue.text = String.format(Locale.getDefault(), "Pedidos Acumulados: Q%.2f", it.totalOrdersValue)
                val remainingOrder = it.orderQuota - it.totalOrdersValue
                tvRemainingOrderQuota.text = String.format(Locale.getDefault(), "Faltante Pedidos: Q%.2f", remainingOrder)
                val orderProgress = if (it.orderQuota > 0) (it.totalOrdersValue / it.orderQuota) * 100 else 0.0
                tvOrderProgressPercentage.text = String.format(Locale.getDefault(), "Progreso: %.1f%%", orderProgress)
                progressBarOrder.progress = orderProgress.toInt()
                progressBarOrder.progressTintList = if (orderProgress >= 100) resources.getColorStateList(R.color.green_accent, null) else resources.getColorStateList(R.color.blue_accent, null)


                // Cuota de Cobros
                tvCollectionQuotaObjective.text = String.format(Locale.getDefault(), "Cuota Cobros: Q%.2f", it.collectionQuota) // Corrected String.Format to String.format
                tvTotalCollectionsValue.text = String.format(Locale.getDefault(), "Cobros Acumulados: Q%.2f", it.totalCollectionsValue)
                val remainingCollection = it.collectionQuota - it.totalCollectionsValue
                tvRemainingCollectionQuota.text = String.format(Locale.getDefault(), "Faltante Cobros: Q%.2f", remainingCollection)
                val collectionProgress = if (it.collectionQuota > 0) (it.totalCollectionsValue / it.collectionQuota) * 100 else 0.0
                tvCollectionProgressPercentage.text = String.format(Locale.getDefault(), "Progreso: %.1f%%", collectionProgress)
                progressBarCollection.progress = collectionProgress.toInt()
                progressBarCollection.progressTintList = if (collectionProgress >= 100) resources.getColorStateList(R.color.green_accent, null) else resources.getColorStateList(R.color.blue_accent, null)


                // Total de Pedidos Pendientes
                tvTotalOutstandingOrders.text = String.format(Locale.getDefault(), "Total Pendiente Global: Q%.2f", it.totalOutstandingOrders)

                // Progreso general (combinado)
                val overallTotalQuota = it.orderQuota + it.collectionQuota
                val overallTotalAchieved = it.totalOrdersValue + it.totalCollectionsValue
                val overallProgress = if (overallTotalQuota > 0) (overallTotalAchieved / overallTotalQuota) * 100 else 0.0
                tvOverallQuotaProgress.text = String.format(Locale.getDefault(), "Progreso General de Cuotas: %.1f%%", overallProgress)
                progressBarOverallQuota.progress = overallProgress.toInt()
                progressBarOverallQuota.progressTintList = if (overallProgress >= 100) resources.getColorStateList(R.color.green_accent, null) else resources.getColorStateList(R.color.blue_accent, null)

            } ?: run {
                // Si no hay datos de cuota, mostrar ceros
                tvOrderQuotaObjective.text = "Cuota Pedidos: Q0.00"
                tvTotalOrdersValue.text = "Pedidos Acumulados: Q0.00"
                tvRemainingOrderQuota.text = "Faltante Pedidos: Q0.00"
                tvOrderProgressPercentage.text = "Progreso: 0.0%"
                progressBarOrder.progress = 0

                tvCollectionQuotaObjective.text = "Cuota Cobros: Q0.00"
                tvTotalCollectionsValue.text = "Cobros Acumulados: Q0.00"
                tvRemainingCollectionQuota.text = "Faltante Cobros: Q0.00"
                tvCollectionProgressPercentage.text = "Progreso: 0.0%"
                progressBarCollection.progress = 0

                tvOverallQuotaProgress.text = "Progreso General de Cuotas: 0.0%"
                progressBarOverallQuota.progress = 0

                tvTotalOutstandingOrders.text = "Total Pendiente Global: Q0.00"
            }
        }

        // Observa la cantidad de giras y médicos/farmacias
        database.giraDao().getAllGiras().observe(viewLifecycleOwner) { giras ->
            tvGiraCount.text = "${giras.size} Giras Activas"
            val totalDoctors = giras.sumOf { it.doctors.size }
            tvDoctorPharmacyCount.text = "${totalDoctors} Médicos/Farmacias Registrados"

            // Actualiza la lista de todos los clientes para la búsqueda global
            allClientsForSearch.clear()
            giras.forEach { gira ->
                gira.doctors.forEach { doctor ->
                    allClientsForSearch.add(SearchResultItem(gira, doctor))
                }
            }
        }

        // Observa la cantidad de medicamentos y detecta bajo stock
        database.medicationDao().getAllMedications().observe(viewLifecycleOwner) { medications ->
            tvMedicationCount.text = "${medications.size} Medicamentos en Bodega"

            val lowStockThreshold = 5 // Define tu umbral de bajo stock aquí
            val lowStockMeds = medications.filter { it.stock <= lowStockThreshold }
            if (lowStockMeds.isNotEmpty()) {
                val lowStockNames = lowStockMeds.joinToString(", ") { it.name }
                tvLowStockMedications.text = "¡Alerta de Bajo Stock!: $lowStockNames"
                tvLowStockMedications.visibility = View.VISIBLE
                tvLowStockMedications.setTextColor(resources.getColor(R.color.red_500, null)) // Color rojo para la alerta
            } else {
                tvLowStockMedications.text = "Todos los medicamentos con stock suficiente."
                tvLowStockMedications.visibility = View.VISIBLE
                tvLowStockMedications.setTextColor(resources.getColor(R.color.green_500, null)) // Color verde si todo está bien
            }
        }
    }

    /**
     * Muestra un diálogo de confirmación antes de reiniciar las cuotas.
     */
    private fun confirmResetQuotas() {
        AlertDialog.Builder(requireContext())
            .setTitle("Confirmar Reinicio de Cuotas")
            .setMessage("¿Estás seguro de que quieres reiniciar las cuotas de pedidos y cobros? Esto no afectará los pedidos de los clientes ni sus saldos pendientes.")
            .setPositiveButton("Reiniciar Cuotas") { dialog, _ ->
                resetQuotas()
                dialog.dismiss()
            }
            .setNegativeButton("Cancelar") { dialog, _ ->
                dialog.cancel()
            }
            .show()
    }

    /**
     * Reinicia las cuotas de pedidos y cobros a cero en la base de datos.
     */
    private fun resetQuotas() {
        lifecycleScope.launch(Dispatchers.IO) {
            database.quotaDao().getQuotaData().value?.let { currentQuota ->
                val updatedQuota = currentQuota.copy(
                    orderQuota = 0.0,
                    totalOrdersValue = 0.0,
                    collectionQuota = 0.0,
                    totalCollectionsValue = 0.0
                    // totalOutstandingOrders no se reinicia aquí ya que depende de los doctores
                )
                database.quotaDao().updateQuotaData(updatedQuota)
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Cuotas reiniciadas exitosamente.", Toast.LENGTH_SHORT).show()
                }
            } ?: run {
                // Si no hay datos de cuota, podemos insertar uno nuevo con ceros
                database.quotaDao().insertQuotaData(QuotaData(
                    orderQuota = 0.0,
                    totalOrdersValue = 0.0,
                    collectionQuota = 0.0,
                    totalCollectionsValue = 0.0,
                    totalOutstandingOrders = 0.0 // Al insertar, también se inicializa a 0
                ))
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Datos de cuota inicializados y reiniciados.", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    /**
     * Muestra un diálogo para realizar una búsqueda global de clientes.
     */
    private fun showGlobalClientSearchDialog() {
        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_global_client_search, null)
        val etSearch = dialogView.findViewById<EditText>(R.id.et_dialog_search_client)
        val recyclerView = dialogView.findViewById<RecyclerView>(R.id.recycler_view_dialog_client_results)
        val tvNoResults = dialogView.findViewById<TextView>(R.id.tv_dialog_no_client_results)

        val clientSearchAdapter = GlobalClientSearchAdapter(mutableListOf()) { gira, doctor ->
            // Navegar al GiraDetailFragment de la gira seleccionada y, opcionalmente, resaltar el doctor
            val detailFragment = GiraDetailFragment.newInstance(gira, doctor.id)
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, detailFragment)
                .addToBackStack(null)
                .commit()
            // Cerrar el diálogo después de la navegación
            (dialogView.parent as? AlertDialog)?.dismiss()
        }

        recyclerView.layoutManager = LinearLayoutManager(context)
        recyclerView.adapter = clientSearchAdapter

        // Observar cambios en la lista de giras para tener la lista de clientes siempre actualizada
        database.giraDao().getAllGiras().observe(viewLifecycleOwner) { giras ->
            allClientsForSearch.clear()
            giras.forEach { gira ->
                gira.doctors.forEach { doctor ->
                    allClientsForSearch.add(SearchResultItem(gira, doctor))
                }
            }
            // Cuando la lista completa de clientes se carga/actualiza, refrescar el adaptador del diálogo si está abierto
            if (etSearch.text.isNotEmpty()) { // Si ya hay texto, aplica el filtro al cargar
                filterGlobalClients(etSearch.text.toString(), clientSearchAdapter, tvNoResults)
            } else { // Si no hay texto, muestra todos los clientes inicialmente
                clientSearchAdapter.updateList(allClientsForSearch.toMutableList())
                tvNoResults.visibility = if (allClientsForSearch.isEmpty()) View.VISIBLE else View.GONE
            }
        }


        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filterGlobalClients(s.toString(), clientSearchAdapter, tvNoResults)
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        // Mostrar el diálogo
        AlertDialog.Builder(requireContext())
            .setTitle("Buscar Cliente")
            .setView(dialogView)
            .setNegativeButton("Cerrar") { dialog, _ ->
                dialog.cancel()
            }
            .show()
    }

    /**
     * Filtra la lista global de clientes según el término de búsqueda.
     */
    private fun filterGlobalClients(query: String, adapter: GlobalClientSearchAdapter, noResultsTextView: TextView) {
        val searchTerm = query.trim().lowercase()
        val filteredList = if (searchTerm.isEmpty()) {
            allClientsForSearch.toMutableList() // Si la búsqueda está vacía, muestra todos
        } else {
            allClientsForSearch.filter { item ->
                item.doctor.name.lowercase().contains(searchTerm) ||
                        item.doctor.location.lowercase().contains(searchTerm) ||
                        item.doctor.phoneNumber.lowercase().contains(searchTerm) ||
                        item.gira.name.lowercase().contains(searchTerm)
            }.toMutableList()
        }
        adapter.updateList(filteredList)
        noResultsTextView.visibility = if (filteredList.isEmpty() && searchTerm.isNotEmpty()) View.VISIBLE else View.GONE
    }
}