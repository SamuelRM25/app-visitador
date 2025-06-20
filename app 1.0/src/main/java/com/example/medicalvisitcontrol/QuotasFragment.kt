package com.example.medicalvisitcontrol.ui.quotas

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.asFlow // Importar asFlow para convertir LiveData a Flow
import com.example.medicalvisitcontrol.R
import com.example.medicalvisitcontrol.data.database.AppDatabase
import com.example.medicalvisitcontrol.data.models.DoctorPharmacy
import com.example.medicalvisitcontrol.data.models.Medication
import com.example.medicalvisitcontrol.data.models.OrderItem // Importar OrderItem
import com.example.medicalvisitcontrol.data.models.Gira // Importar Gira para buscar doctores en giras
import com.example.medicalvisitcontrol.data.dao.GiraDao // Importar GiraDao
import com.example.medicalvisitcontrol.data.dao.MedicationDao // Importar MedicationDao
import com.example.medicalvisitcontrol.data.models.QuotaData
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.firstOrNull // Importar firstOrNull para Flows
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

class QuotaFragment : Fragment() {

    private lateinit var database: AppDatabase
    private lateinit var giraDao: GiraDao // Referencia al DAO de Giras
    private lateinit var medicationDao: MedicationDao // Referencia al DAO de Medicamentos
    private val TAG = "QuotaFragment"

    // UI elements for Order Quotas
    private lateinit var etOrderQuotaInput: EditText
    private lateinit var btnSaveOrderQuota: Button
    private lateinit var etSearchDoctorOrder: EditText // Nuevo EditText para búsqueda de doctor en pedidos
    private lateinit var spinnerDoctorsOrder: Spinner
    private lateinit var btnAddOrder: Button
    private lateinit var tvOrderQuotaObjective: TextView
    private lateinit var tvTotalOrdersValue: TextView
    private lateinit var tvRemainingOrderQuota: TextView
    private lateinit var tvOrderProgressPercentage: TextView
    private lateinit var progressBarOrder: ProgressBar

    // UI elements for Collection Quotas
    private lateinit var etCollectionQuotaInput: EditText
    private lateinit var btnSaveCollectionQuota: Button
    private lateinit var etSearchDoctorCollection: EditText // Nuevo EditText para búsqueda de doctor en cobros
    private lateinit var etCollectionAmount: EditText
    private lateinit var btnAddCollection: Button
    private lateinit var tvCollectionQuotaObjective: TextView
    private lateinit var tvTotalCollectionsValue: TextView
    private lateinit var tvRemainingCollectionQuota: TextView
    private lateinit var tvCollectionProgressPercentage: TextView
    private lateinit var progressBarCollection: ProgressBar
    private lateinit var spinnerDoctorsCollection: Spinner
    private lateinit var tvClientOutstandingBalance: TextView

    // UI elements for general actions
    private lateinit var btnResetAllQuotas: Button

    // Data holders
    private var currentQuotaData: QuotaData? = null
    private var allDoctors: List<DoctorPharmacy> = emptyList()
    private var allMedications: List<Medication> = emptyList()
    private var selectedDoctorForOrder: DoctorPharmacy? = null
    private var selectedDoctorForCollection: DoctorPharmacy? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        database = AppDatabase.getDatabase(requireContext())
        giraDao = database.giraDao()
        medicationDao = database.medicationDao()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        try {
            val view = inflater.inflate(R.layout.fragment_quota, container, false)

            // Initialize Order Quota UI
            etOrderQuotaInput = view.findViewById(R.id.et_order_quota_input)
            btnSaveOrderQuota = view.findViewById(R.id.btn_save_order_quota)
            etSearchDoctorOrder = view.findViewById(R.id.et_search_doctor_order) // Inicializar
            spinnerDoctorsOrder = view.findViewById(R.id.spinner_doctors_order)
            btnAddOrder = view.findViewById(R.id.btn_add_order)
            tvOrderQuotaObjective = view.findViewById(R.id.tv_order_quota_objective)
            tvTotalOrdersValue = view.findViewById(R.id.tv_total_orders_value)
            tvRemainingOrderQuota = view.findViewById(R.id.tv_remaining_order_quota)
            tvOrderProgressPercentage = view.findViewById(R.id.tv_order_progress_percentage)
            progressBarOrder = view.findViewById(R.id.progress_bar_order)

            // Initialize Collection Quota UI
            etCollectionQuotaInput = view.findViewById(R.id.et_collection_quota_input)
            btnSaveCollectionQuota = view.findViewById(R.id.btn_save_collection_quota)
            etSearchDoctorCollection = view.findViewById(R.id.et_search_doctor_collection) // Inicializar
            etCollectionAmount = view.findViewById(R.id.et_collection_amount)
            btnAddCollection = view.findViewById(R.id.btn_add_collection)
            tvCollectionQuotaObjective = view.findViewById(R.id.tv_collection_quota_objective)
            tvTotalCollectionsValue = view.findViewById(R.id.tv_total_collections_value)
            tvRemainingCollectionQuota = view.findViewById(R.id.tv_remaining_collection_quota)
            tvCollectionProgressPercentage = view.findViewById(R.id.tv_collection_progress_percentage)
            progressBarCollection = view.findViewById(R.id.progress_bar_collection)
            spinnerDoctorsCollection = view.findViewById(R.id.spinner_doctors_collection)
            tvClientOutstandingBalance = view.findViewById(R.id.tv_client_outstanding_balance)

            // Initialize general action UI
            btnResetAllQuotas = view.findViewById(R.id.btn_reset_all_quotas)

            setupListeners()
            observeData()
            loadInitialData()

            return view
        } catch (e: Exception) {
            Log.e(TAG, "Error in onCreateView of QuotaFragment: ${e.message}", e)
            Toast.makeText(requireContext(), "Error al cargar la pantalla de Cuotas. Revisa el Logcat.", Toast.LENGTH_LONG).show()
            return null
        }
    }

    private fun setupListeners() {
        btnSaveOrderQuota.setOnClickListener { saveOrderQuota() }
        btnAddOrder.setOnClickListener { showAddOrderDialog() }
        btnSaveCollectionQuota.setOnClickListener { saveCollectionQuota() }
        btnAddCollection.setOnClickListener { addCollection() }
        btnResetAllQuotas.setOnClickListener { confirmResetAllQuotas() }

        // Listeners para los campos de búsqueda
        etSearchDoctorOrder.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filterDoctorsForSpinner(s.toString(), spinnerDoctorsOrder, true)
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        etSearchDoctorCollection.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filterDoctorsForSpinner(s.toString(), spinnerDoctorsCollection, false)
            }
            override fun afterTextChanged(s: Editable?) {}
        })
    }

    private fun observeData() {
        // Observa los datos de cuotas de la base de datos
        database.quotaDao().getQuotaData().observe(viewLifecycleOwner) { quotaData ->
            currentQuotaData = quotaData
            updateUI()
            Log.d(TAG, "QuotaData loaded: $quotaData")
        }

        // Observa todos los doctores para los spinners (pedidos y cobros)
        database.giraDao().getAllGiras().observe(viewLifecycleOwner) { giras ->
            allDoctors = giras.flatMap { it.doctors }.distinctBy { it.id }

            // Inicializa los adaptadores de los spinners con la lista completa de doctores
            // Esto también aplicará cualquier término de búsqueda existente si el usuario ha escrito algo
            filterDoctorsForSpinner(etSearchDoctorOrder.text.toString(), spinnerDoctorsOrder, true)
            filterDoctorsForSpinner(etSearchDoctorCollection.text.toString(), spinnerDoctorsCollection, false)

            Log.d(TAG, "Doctors loaded for spinners: ${allDoctors.size}")
        }

        // Observa todos los medicamentos para la selección en el diálogo de pedidos
        database.medicationDao().getAllMedications().observe(viewLifecycleOwner) { medications ->
            allMedications = medications
            Log.d(TAG, "Medications loaded: ${allMedications.size}")
        }
    }

    private fun loadInitialData() {
        lifecycleScope.launch(Dispatchers.IO) {
            val quotaData = database.quotaDao().getQuotaData().asFlow().firstOrNull()
            if (quotaData == null) {
                // Si no hay datos, insertar una entrada inicial con ceros
                val initialQuota = QuotaData(
                    orderQuota = 0.0,
                    totalOrdersValue = 0.0,
                    collectionQuota = 0.0,
                    totalCollectionsValue = 0.0,
                    totalOutstandingOrders = 0.0
                )
                database.quotaDao().insertQuotaData(initialQuota)
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Datos de cuotas inicializados.", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun updateUI() {
        currentQuotaData?.let { data ->
            // Update Order Quota UI
            etOrderQuotaInput.setText(String.format(Locale.getDefault(), "%.2f", data.orderQuota))
            tvOrderQuotaObjective.text = String.format(Locale.getDefault(), "Cuota Pedidos: Q%.2f", data.orderQuota)
            tvTotalOrdersValue.text = String.format(Locale.getDefault(), "Pedidos Acumulados: Q%.2f", data.totalOrdersValue)
            val remainingOrder = data.orderQuota - data.totalOrdersValue
            tvRemainingOrderQuota.text = String.format(Locale.getDefault(), "Faltante Pedidos: Q%.2f", remainingOrder)
            val orderProgress = if (data.orderQuota > 0) (data.totalOrdersValue / data.orderQuota) * 100 else 0.0
            tvOrderProgressPercentage.text = String.format(Locale.getDefault(), "Progreso Pedidos: %.1f%%", orderProgress)
            progressBarOrder.progress = orderProgress.toInt()
            progressBarOrder.progressTintList = if (orderProgress >= 100) resources.getColorStateList(R.color.green_accent, null) else resources.getColorStateList(R.color.blue_accent, null)

            // Update Collection Quota UI
            etCollectionQuotaInput.setText(String.format(Locale.getDefault(), "%.2f", data.collectionQuota))
            tvCollectionQuotaObjective.text = String.format(Locale.getDefault(), "Cuota Cobros: Q%.2f", data.collectionQuota)
            tvTotalCollectionsValue.text = String.format(Locale.getDefault(), "Cobros Acumulados: Q%.2f", data.totalCollectionsValue)
            val remainingCollection = data.collectionQuota - data.totalCollectionsValue
            tvRemainingCollectionQuota.text = String.format(Locale.getDefault(), "Faltante Cobros: Q%.2f", remainingCollection)
            val collectionProgress = if (data.collectionQuota > 0) (data.totalCollectionsValue / data.collectionQuota) * 100 else 0.0
            tvCollectionProgressPercentage.text = String.format(Locale.getDefault(), "Progreso Cobros: %.1f%%", collectionProgress)
            progressBarCollection.progress = collectionProgress.toInt()
            progressBarCollection.progressTintList = if (collectionProgress >= 100) resources.getColorStateList(R.color.green_accent, null) else resources.getColorStateList(R.color.blue_accent, null)

            // Update outstanding orders info (not directly tied to a progress bar, but important)
            view?.findViewById<TextView>(R.id.tv_outstanding_orders)?.text = String.format(Locale.getDefault(), "Pedidos Pendientes Globales: Q%.2f", data.totalOutstandingOrders)

            // Update client outstanding balance in collection section
            tvClientOutstandingBalance.text = String.format(Locale.getDefault(), "Pendiente Cliente: Q%.2f", selectedDoctorForCollection?.outstandingBalance ?: 0.0)

        } ?: run {
            // Handle case where quotaData is null (should be initialized by loadInitialData)
            Log.w(TAG, "QuotaData is null in updateUI.")
            // Clear UI or set default values if needed
            etOrderQuotaInput.setText("0.00")
            etCollectionQuotaInput.setText("0.00")
            tvClientOutstandingBalance.text = "Pendiente Cliente: Q0.00"
        }
    }

    /**
     * Filtra la lista de doctores para el spinner dado, actualiza su adaptador
     * y maneja la selección del doctor actual.
     * @param searchTerm El término de búsqueda introducido por el usuario.
     * @param spinner El Spinner que se va a actualizar (pedidos o cobros).
     * @param isOrderSpinner Indica si el spinner es para pedidos (true) o cobros (false).
     */
    private fun filterDoctorsForSpinner(searchTerm: String, spinner: Spinner, isOrderSpinner: Boolean) {
        val filteredDoctors = if (searchTerm.isBlank()) {
            allDoctors
        } else {
            allDoctors.filter {
                it.name.contains(searchTerm, ignoreCase = true) ||
                        it.location.contains(searchTerm, ignoreCase = true) ||
                        it.phoneNumber.contains(searchTerm, ignoreCase = true)
            }
        }.toMutableList() // Asegurarse de que sea una lista mutable

        val doctorNames = filteredDoctors.map { it.name }
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, doctorNames)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

        spinner.adapter = adapter

        // Intentar mantener la selección actual si el doctor sigue en la lista filtrada
        val currentSelectedId = if (isOrderSpinner) selectedDoctorForOrder?.id else selectedDoctorForCollection?.id
        val newSelectionIndex = filteredDoctors.indexOfFirst { it.id == currentSelectedId }

        if (newSelectionIndex != -1) {
            spinner.setSelection(newSelectionIndex)
            val selectedDoctor = filteredDoctors[newSelectionIndex]
            if (isOrderSpinner) {
                selectedDoctorForOrder = selectedDoctor
            } else {
                selectedDoctorForCollection = selectedDoctor
                tvClientOutstandingBalance.text = String.format(Locale.getDefault(), "Pendiente Cliente: Q%.2f", selectedDoctor?.outstandingBalance ?: 0.0)
            }
        } else {
            // Si el doctor previamente seleccionado no está en la lista filtrada, seleccionar el primero si existe
            if (filteredDoctors.isNotEmpty()) {
                spinner.setSelection(0)
                val selectedDoctor = filteredDoctors[0]
                if (isOrderSpinner) {
                    selectedDoctorForOrder = selectedDoctor
                } else {
                    selectedDoctorForCollection = selectedDoctor
                    tvClientOutstandingBalance.text = String.format(Locale.getDefault(), "Pendiente Cliente: Q%.2f", selectedDoctor?.outstandingBalance ?: 0.0)
                }
            } else {
                // Si la lista filtrada está vacía, no hay selección
                if (isOrderSpinner) {
                    selectedDoctorForOrder = null
                } else {
                    selectedDoctorForCollection = null
                    tvClientOutstandingBalance.text = "Pendiente Cliente: Q0.00"
                }
            }
        }

        // Configurar el listener del spinner para que trabaje con la lista filtrada
        spinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val currentSelectedDoctor = filteredDoctors.getOrNull(position) // Usar getOrNull para seguridad
                if (isOrderSpinner) {
                    selectedDoctorForOrder = currentSelectedDoctor
                } else {
                    selectedDoctorForCollection = currentSelectedDoctor
                    tvClientOutstandingBalance.text = String.format(Locale.getDefault(), "Pendiente Cliente: Q%.2f", currentSelectedDoctor?.outstandingBalance ?: 0.0)
                }
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {
                if (isOrderSpinner) {
                    selectedDoctorForOrder = null
                } else {
                    selectedDoctorForCollection = null
                    tvClientOutstandingBalance.text = "Pendiente Cliente: Q0.00"
                }
            }
        }
    }

    private fun saveOrderQuota() {
        val quotaText = etOrderQuotaInput.text.toString()
        if (quotaText.isNotEmpty()) {
            try {
                val newQuota = quotaText.toDouble()
                lifecycleScope.launch(Dispatchers.IO) {
                    val quotaData = currentQuotaData ?: QuotaData(1, 0.0, 0.0, 0.0, 0.0, 0.0)
                    quotaData.orderQuota = newQuota
                    database.quotaDao().insertQuotaData(quotaData)
                    withContext(Dispatchers.Main) {
                        Toast.makeText(context, "Cuota de pedidos guardada.", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: NumberFormatException) {
                Toast.makeText(context, "Por favor, ingrese un número válido para la cuota de pedidos.", Toast.LENGTH_SHORT).show()
            }
        } else {
            Toast.makeText(context, "Por favor, ingrese un valor para la cuota de pedidos.", Toast.LENGTH_SHORT).show()
        }
    }

    private fun saveCollectionQuota() {
        val quotaText = etCollectionQuotaInput.text.toString()
        if (quotaText.isNotEmpty()) {
            try {
                val newQuota = quotaText.toDouble()
                lifecycleScope.launch(Dispatchers.IO) {
                    val quotaData = currentQuotaData ?: QuotaData(1, 0.0, 0.0, 0.0, 0.0, 0.0)
                    quotaData.collectionQuota = newQuota
                    database.quotaDao().insertQuotaData(quotaData)
                    withContext(Dispatchers.Main) {
                        Toast.makeText(context, "Cuota de cobros guardada.", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: NumberFormatException) {
                Toast.makeText(context, "Por favor, ingrese un número válido para la cuota de cobros.", Toast.LENGTH_SHORT).show()
            }
        } else {
            Toast.makeText(context, "Por favor, ingrese un valor para la cuota de cobros.", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showAddOrderDialog() {
        if (selectedDoctorForOrder == null) {
            Toast.makeText(context, "Por favor, selecciona un doctor para registrar el pedido.", Toast.LENGTH_SHORT).show()
            return
        }
        if (allMedications.isEmpty()) {
            Toast.makeText(context, "No hay medicamentos en bodega. Por favor, añade medicamentos primero.", Toast.LENGTH_LONG).show()
            return
        }

        val tempOrderItems = mutableListOf<OrderItem>() // Para construir el pedido antes de confirmar
        var currentOrderTotalPrice = 0.0 // Para el resumen en el diálogo

        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_add_order, null)
        val tvDoctorName = dialogView.findViewById<TextView>(R.id.tv_dialog_doctor_name)
        val etQuantity = dialogView.findViewById<EditText>(R.id.et_dialog_medication_quantity)
        val etCustomPrice = dialogView.findViewById<EditText>(R.id.et_dialog_medication_custom_price) // Nuevo EditText
        val spinnerMedication = dialogView.findViewById<Spinner>(R.id.spinner_dialog_medication)
        val tvOrderSummary = dialogView.findViewById<TextView>(R.id.tv_dialog_order_summary)

        tvDoctorName.text = "Doctor: ${selectedDoctorForOrder?.name}"

        // Configurar spinner de medicamentos
        val medicationNames = allMedications.map { "${it.name} (${it.presentation}) - Stock: ${it.stock}" }
        val medicationAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, medicationNames)
        medicationAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerMedication.adapter = medicationAdapter

        var currentSelectedMedication: Medication? = null
        spinnerMedication.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                currentSelectedMedication = allMedications[position]
                // Establecer el precio de venta por defecto del medicamento seleccionado en el campo de precio personalizado
                etCustomPrice.setText(String.format(Locale.getDefault(), "%.2f", currentSelectedMedication?.price ?: 0.0))
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {
                currentSelectedMedication = null
                etCustomPrice.setText("0.00")
            }
        }

        // Añadir medicamento al pedido temporal
        dialogView.findViewById<Button>(R.id.btn_add_medication_to_order).setOnClickListener {
            val quantityStr = etQuantity.text.toString()
            val quantity = quantityStr.toIntOrNull()
            val customPriceStr = etCustomPrice.text.toString()
            val customPrice = customPriceStr.toDoubleOrNull()

            if (currentSelectedMedication != null && quantity != null && quantity > 0 && customPrice != null && customPrice >= 0) {
                if (quantity <= currentSelectedMedication!!.stock) {
                    val newOrderItem = OrderItem(currentSelectedMedication!!.id, quantity, customPrice)
                    tempOrderItems.add(newOrderItem)
                    currentOrderTotalPrice += (quantity * customPrice) // Acumular el total del pedido

                    // Actualizar el resumen del pedido
                    tvOrderSummary.append("${currentSelectedMedication!!.name} (x${quantity}) @ Q${String.format("%.2f", customPrice)} = Q${String.format("%.2f", quantity * customPrice)}\n")
                    tvOrderSummary.append("Total Pedido Actual: Q${String.format("%.2f", currentOrderTotalPrice)}\n\n")

                    etQuantity.setText("") // Limpiar cantidad
                    // No limpiar el precio personalizado, ya que puede ser el mismo para el siguiente item
                    Toast.makeText(context, "${currentSelectedMedication!!.name} añadida al pedido.", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(context, "Cantidad excede el stock disponible (${currentSelectedMedication!!.stock}).", Toast.LENGTH_SHORT).show()
                }
            } else {
                Toast.makeText(context, "Ingresa cantidad, precio y selecciona un medicamento.", Toast.LENGTH_SHORT).show()
            }
        }


        AlertDialog.Builder(requireContext())
            .setTitle("Registrar Nuevo Pedido")
            .setView(dialogView)
            .setPositiveButton("Confirmar Pedido") { dialog, _ ->
                if (tempOrderItems.isEmpty()) {
                    Toast.makeText(context, "El pedido está vacío. Añade medicamentos.", Toast.LENGTH_SHORT).show()
                    dialog.dismiss()
                    return@setPositiveButton
                }

                lifecycleScope.launch(Dispatchers.IO) {
                    val orderValue = tempOrderItems.sumOf { it.quantity * it.customPrice }

                    // Obtener la gira más reciente para el doctor seleccionado
                    val currentGiras = giraDao.getAllGiras().asFlow().firstOrNull() ?: emptyList()
                    var giraToUpdate: Gira? = null
                    var doctorInGira: DoctorPharmacy? = null
                    var doctorIndex = -1

                    // Buscar el doctor en la lista aplanada de todos los doctores
                    // Y luego encontrar la gira a la que pertenece ese doctor
                    for (gira in currentGiras) {
                        doctorIndex = gira.doctors.indexOfFirst { it.id == selectedDoctorForOrder?.id }
                        if (doctorIndex != -1) {
                            giraToUpdate = gira
                            doctorInGira = gira.doctors[doctorIndex]
                            break
                        }
                    }

                    if (giraToUpdate != null && doctorInGira != null) {
                        // Actualizar los orderedItems y outstandingBalance del doctor
                        val updatedOrderedItems = (doctorInGira.orderedItems + tempOrderItems).toMutableList()
                        val updatedDoctor = doctorInGira.copy(
                            orderedItems = updatedOrderedItems,
                            outstandingBalance = doctorInGira.outstandingBalance + orderValue // Sumar al saldo pendiente
                        )
                        giraToUpdate.doctors[doctorIndex] = updatedDoctor
                        giraDao.updateGira(giraToUpdate) // Guardar la gira actualizada en la DB
                    } else {
                        Log.e(TAG, "No se encontró la gira o el doctor para actualizar el pedido.")
                        withContext(Dispatchers.Main) {
                            Toast.makeText(context, "Error al registrar el pedido: Doctor no encontrado.", Toast.LENGTH_LONG).show()
                        }
                        dialog.dismiss()
                        return@launch
                    }

                    // Actualizar stock para los medicamentos pedidos
                    val stockUpdates = mutableMapOf<String, Int>()
                    tempOrderItems.forEach { orderItem ->
                        stockUpdates[orderItem.medicationId] = (stockUpdates[orderItem.medicationId] ?: 0) + orderItem.quantity
                    }

                    stockUpdates.forEach { (medicationId, quantityOrdered) ->
                        val originalMed = medicationDao.getMedicationById(medicationId)
                        originalMed?.let {
                            if (it.stock >= quantityOrdered) {
                                it.stock -= quantityOrdered
                                medicationDao.updateMedication(it)
                            } else {
                                Log.e(TAG, "Stock insuficiente para ${it.name}. Pedido parcial o error lógico.")
                                // Considerar un Toast de advertencia aquí
                            }
                        }
                    }

                    // Actualizar los datos de cuotas globales
                    val quotaData = currentQuotaData ?: QuotaData(1, 0.0, 0.0, 0.0, 0.0, 0.0)
                    quotaData.totalOrdersValue += orderValue
                    quotaData.totalOutstandingOrders += orderValue // Sumar al total global de pendientes
                    database.quotaDao().insertQuotaData(quotaData)

                    withContext(Dispatchers.Main) {
                        Toast.makeText(context, "Pedido registrado exitosamente. Valor: Q${String.format("%.2f", orderValue)}", Toast.LENGTH_LONG).show()
                        etQuantity.setText("") // Limpiar input
                        updateUI() // Actualizar UI después de que los datos cambien
                    }
                }
                dialog.dismiss()
            }
            .setNegativeButton("Cancelar") { dialog, _ ->
                dialog.cancel()
            }
            .show()
    }


    private fun addCollection() {
        val amountText = etCollectionAmount.text.toString()
        if (amountText.isNotEmpty()) {
            try {
                val collectionAmount = amountText.toDouble()
                if (collectionAmount > 0) {
                    if (selectedDoctorForCollection == null) {
                        Toast.makeText(context, "Por favor, selecciona un cliente para registrar el cobro.", Toast.LENGTH_SHORT).show()
                        return
                    }

                    lifecycleScope.launch(Dispatchers.IO) {
                        val doctor = selectedDoctorForCollection!! // Sabemos que no es null por la comprobación anterior
                        val currentGiras = giraDao.getAllGiras().asFlow().firstOrNull() ?: emptyList()
                        var giraToUpdate: Gira? = null
                        var doctorIndex = -1

                        for (gira in currentGiras) {
                            doctorIndex = gira.doctors.indexOfFirst { it.id == doctor.id }
                            if (doctorIndex != -1) {
                                giraToUpdate = gira
                                break
                            }
                        }

                        if (giraToUpdate != null && doctorIndex != -1) {
                            // Actualizar el outstandingBalance del doctor específico
                            val updatedDoctor = doctor.copy(
                                outstandingBalance = (doctor.outstandingBalance - collectionAmount).coerceAtLeast(0.0)
                            )
                            giraToUpdate.doctors[doctorIndex] = updatedDoctor
                            giraDao.updateGira(giraToUpdate) // Guarda la gira actualizada en la DB
                        } else {
                            Log.e(TAG, "No se encontró la gira o el doctor para actualizar el cobro.")
                            withContext(Dispatchers.Main) {
                                Toast.makeText(context, "Error al registrar el cobro: Cliente no encontrado.", Toast.LENGTH_LONG).show()
                            }
                            return@launch
                        }

                        // Actualizar los datos de cuotas globales
                        val quotaData = currentQuotaData ?: QuotaData(1, 0.0, 0.0, 0.0, 0.0, 0.0)
                        quotaData.totalCollectionsValue += collectionAmount
                        quotaData.totalOutstandingOrders -= collectionAmount // Reduce outstanding orders
                        if (quotaData.totalOutstandingOrders < 0) quotaData.totalOutstandingOrders = 0.0 // Asegurar que no sea negativo

                        database.quotaDao().insertQuotaData(quotaData)

                        withContext(Dispatchers.Main) {
                            Toast.makeText(context, "Cobro de Q${String.format("%.2f", collectionAmount)} registrado para ${doctor.name}.", Toast.LENGTH_SHORT).show()
                            etCollectionAmount.setText("") // Limpiar input
                            updateUI()
                        }
                    }
                } else {
                    Toast.makeText(context, "El monto del cobro debe ser mayor a 0.", Toast.LENGTH_SHORT).show()
                }
            } catch (e: NumberFormatException) {
                Toast.makeText(context, "Por favor, ingrese un número válido para el cobro.", Toast.LENGTH_SHORT).show()
            }
        } else {
            Toast.makeText(context, "Por favor, ingrese un monto de cobro.", Toast.LENGTH_SHORT).show()
        }
    }

    private fun confirmResetAllQuotas() {
        AlertDialog.Builder(requireContext())
            .setTitle("Confirmar Reinicio de Cuotas")
            .setMessage("¿Estás seguro de que quieres reiniciar las cuotas de pedidos y cobros, y sus totales acumulados? Esto NO afectará el historial de pedidos ni los saldos pendientes de cada cliente.")
            .setPositiveButton("Reiniciar") { dialog, _ ->
                lifecycleScope.launch(Dispatchers.IO) {
                    val quotaData = database.quotaDao().getQuotaData().asFlow().firstOrNull() ?: QuotaData(1, 0.0, 0.0, 0.0, 0.0, 0.0)

                    // Solo reiniciar las cuotas y los valores acumulados de pedidos y cobros
                    val updatedQuota = quotaData.copy(
                        orderQuota = 0.0,
                        totalOrdersValue = 0.0,
                        collectionQuota = 0.0,
                        totalCollectionsValue = 0.0
                        // totalOutstandingOrders NO se reinicia aquí, se mantiene su valor actual
                    )
                    database.quotaDao().insertQuotaData(updatedQuota) // Usa insert con REPLACE para actualizar el único registro

                    // **IMPORTANTE**: Las siguientes líneas se han eliminado para NO afectar los doctores
                    // giraDao.getAllGiras().asFlow().firstOrNull()?.let { currentGiras ->
                    //     currentGiras.forEach { gira ->
                    //         val updatedDoctors = gira.doctors.map { doctor ->
                    //             doctor.copy(outstandingBalance = 0.0, orderedItems = mutableListOf())
                    //         }.toMutableList()
                    //         giraDao.updateGira(gira.copy(doctors = updatedDoctors))
                    //     }
                    // }

                    withContext(Dispatchers.Main) {
                        Toast.makeText(context, "Cuotas de pedidos y cobros reiniciadas exitosamente.", Toast.LENGTH_SHORT).show()
                        updateUI()
                    }
                }
                dialog.dismiss()
            }
            .setNegativeButton("Cancelar") { dialog, _ ->
                dialog.cancel()
            }
            .show()
    }
}