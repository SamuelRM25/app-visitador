package com.example.medicalvisitcontrol.ui.medicalvisits

import android.app.Activity // Importar Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.text.Editable // Importar Editable
import android.text.TextWatcher // Importar TextWatcher
import android.util.Log // Importar Log
import android.view.LayoutInflater
import android.view.View // Importar View
import android.view.ViewGroup
import android.widget.Button // Importar Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.RadioButton
import android.widget.RadioGroup
import android.widget.Switch
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.LifecycleOwner // Importar LifecycleOwner
import androidx.lifecycle.lifecycleScope // Importar lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.medicalvisitcontrol.R
import com.example.medicalvisitcontrol.data.database.AppDatabase // Importar AppDatabase
import com.example.medicalvisitcontrol.data.models.DoctorPharmacy
import com.example.medicalvisitcontrol.data.models.Gira
import com.example.medicalvisitcontrol.data.models.Medication // Importar Medication
import com.example.medicalvisitcontrol.data.models.OrderItem // Importar OrderItem
import com.google.android.material.floatingactionbutton.FloatingActionButton
import kotlinx.coroutines.Dispatchers // Importar Dispatchers
import kotlinx.coroutines.launch // Importar launch
import kotlinx.coroutines.withContext
import java.util.UUID
import java.util.ArrayList // Importar ArrayList

class GiraDetailFragment : Fragment() {

    private lateinit var gira: Gira // La gira actual que se está mostrando (inicializada desde args)
    private lateinit var recyclerViewDoctors: RecyclerView
    private lateinit var doctorAdapter: DoctorPharmacyAdapter
    private lateinit var fabAddDoctor: FloatingActionButton
    private lateinit var tvNoDoctors: TextView
    private lateinit var radioGroupFilter: RadioGroup // Nuevo RadioGroup para filtrar
    private lateinit var rbAllClients: RadioButton
    private lateinit var rbVisitedClients: RadioButton
    private lateinit var rbNotVisitedClients: RadioButton
    private lateinit var etSearchClient: EditText // Nuevo EditText para buscar clientes

    private lateinit var database: AppDatabase // Instancia de la base de datos
    private val TAG = "GiraDetailFragment"

    // Variable para el EditText de ubicación del diálogo
    private var etLocationInDialog: EditText? = null

    // Variables para almacenar la lista de IDs y nombres de medicamentos seleccionados temporalmente
    private var selectedOrderItems: MutableList<OrderItem> = mutableListOf()
    private var selectedMedicationNamesForDisplay: MutableList<String> = mutableListOf()


    // Launcher para la actividad/fragmento de selección de mapa
    private val mapPickerLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val selectedLat = result.data?.getDoubleExtra(MapPickerFragment.EXTRA_SELECTED_LAT, 0.0)
            val selectedLng = result.data?.getDoubleExtra(MapPickerFragment.EXTRA_SELECTED_LNG, 0.0)

            if (selectedLat != null && selectedLng != null) {
                val locationString = "$selectedLat,$selectedLng"
                etLocationInDialog?.setText(locationString) // Actualiza el EditText con la ubicación
                Toast.makeText(context, "Ubicación seleccionada: $locationString", Toast.LENGTH_LONG).show()
            }
        }
    }

    // Launcher para la selección de medicamentos
    private val medicationPickerLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            result.data?.getSerializableExtra("selected_order_items")?.let { items ->
                selectedOrderItems = items as MutableList<OrderItem>
            }
            result.data?.getStringArrayListExtra("selected_medication_names")?.let { names ->
                selectedMedicationNamesForDisplay = names.toMutableList()
            }
            // Actualiza el TextView del diálogo con los nombres de los medicamentos seleccionados
            val tvSelectedMedications = etLocationInDialog?.rootView?.findViewById<TextView>(R.id.tv_selected_medications)
            tvSelectedMedications?.text = if (selectedMedicationNamesForDisplay.isNotEmpty()) {
                "Pedidos: ${selectedMedicationNamesForDisplay.joinToString(", ")}"
            } else {
                "Ningún medicamento seleccionado"
            }
            tvSelectedMedications?.visibility = View.VISIBLE // Asegura que el TextView sea visible
        }
    }


    companion object {
        private const val ARG_GIRA = "gira_object"
        const val EXTRA_SELECTED_DOCTOR_ID = "selected_doctor_id" // Nuevo extra para pasar el ID del doctor

        /**
         * Crea una nueva instancia de GiraDetailFragment.
         * @param gira La gira cuyos detalles se mostrarán.
         * @param selectedDoctorId Opcional: El ID de un DoctorPharmacy para desplazar la vista hasta él.
         * @return Una nueva instancia de GiraDetailFragment.
         */
        fun newInstance(gira: Gira, selectedDoctorId: String? = null): GiraDetailFragment {
            val fragment = GiraDetailFragment()
            val args = Bundle().apply {
                putSerializable(ARG_GIRA, gira) // Pasa el objeto Gira serializable
                selectedDoctorId?.let { putString(EXTRA_SELECTED_DOCTOR_ID, it) }
            }
            fragment.arguments = args
            return fragment
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Recupera el objeto Gira de los argumentos
        arguments?.let {
            gira = it.getSerializable(ARG_GIRA) as Gira
        } ?: run {
            // Manejar caso donde gira es null (no debería ocurrir si se llama con newInstance)
            Log.e(TAG, "Error: Gira object is null in GiraDetailFragment onCreate.")
            // Puedes cerrar el fragmento o mostrar un error al usuario
            requireActivity().supportFragmentManager.popBackStack()
        }
        database = AppDatabase.getDatabase(requireContext()) // Inicializa la base de datos
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        try {
            val view = inflater.inflate(R.layout.fragment_gira_detail, container, false)

            val giraTitle: TextView = view.findViewById(R.id.gira_detail_title)
            val giraDescription: TextView = view.findViewById(R.id.gira_detail_description)
            recyclerViewDoctors = view.findViewById(R.id.recycler_view_doctors)
            fabAddDoctor = view.findViewById(R.id.fab_add_doctor)
            tvNoDoctors = view.findViewById(R.id.tv_no_doctors)
            radioGroupFilter = view.findViewById(R.id.radio_group_filter) // Inicializar
            rbAllClients = view.findViewById(R.id.rb_all_clients)
            rbVisitedClients = view.findViewById(R.id.rb_visited_clients)
            rbNotVisitedClients = view.findViewById(R.id.rb_not_visited_clients)
            etSearchClient = view.findViewById(R.id.et_search_client) // Inicializar el EditText de búsqueda


            giraTitle.text = gira.name
            giraDescription.text = gira.description

            recyclerViewDoctors.layoutManager = LinearLayoutManager(context)
            doctorAdapter = DoctorPharmacyAdapter(
                gira.doctors, // Pasamos la lista actual de doctors de la gira
                database.medicationDao(), // Pasamos el DAO de medicamentos
                viewLifecycleOwner, // Pasa el LifecycleOwner aquí
                onItemClick = { doctor ->
                    openLocationInMaps(doctor.location)
                },
                onItemEditClick = { doctor -> // IMPLEMENTACIÓN DE EDITAR
                    showAddDoctorDialog(doctor)
                },
                onItemDeleteClick = { doctor ->
                    confirmDeleteDoctorPharmacy(doctor)
                },
                onVisitedStatusChange = { doctor, isVisited -> // Nuevo callback
                    updateDoctorVisitedStatus(doctor, isVisited)
                }
            )
            recyclerViewDoctors.adapter = doctorAdapter

            // Configurar listener para el RadioGroup
            radioGroupFilter.setOnCheckedChangeListener { _, checkedId ->
                filterDoctors()
            }
            // Seleccionar "Todos" por defecto
            rbAllClients.isChecked = true
            filterDoctors() // Aplicar filtro inicial

            // Configurar TextWatcher para el EditText de búsqueda
            etSearchClient.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                    filterDoctors() // Vuelve a aplicar el filtro cuando el texto cambia
                }
                override fun afterTextChanged(s: Editable?) {}
            })

            // Verificar si hay un doctor_id para desplazar la vista
            arguments?.getString(EXTRA_SELECTED_DOCTOR_ID)?.let { doctorId ->
                recyclerViewDoctors.post { // Asegúrate de que el layout esté listo
                    scrollToDoctor(doctorId)
                }
            }

            updateNoDoctorsVisibility()

            fabAddDoctor.setOnClickListener {
                showAddDoctorDialog(null) // Pasa null para indicar que es un nuevo médico/farmacia
            }

            return view
        } catch (e: Exception) {
            Log.e(TAG, "Error en onCreateView de GiraDetailFragment: ${e.message}", e)
            Toast.makeText(requireContext(), "Error al cargar el detalle de la gira. Revisa el Logcat.", Toast.LENGTH_LONG).show()
            return null // Retorna null para evitar más errores si la vista no se infló
        }
    }

    /**
     * Desplaza el RecyclerView hasta la posición del DoctorPharmacy con el ID especificado.
     */
    private fun scrollToDoctor(doctorId: String) {
        val position = doctorAdapter.doctors.indexOfFirst { it.id == doctorId }
        if (position != -1) {
            (recyclerViewDoctors.layoutManager as? LinearLayoutManager)?.scrollToPositionWithOffset(position, 0)
            // Opcional: Resaltar el elemento, por ejemplo, con un fondo temporal
            val viewHolder = recyclerViewDoctors.findViewHolderForAdapterPosition(position)
            viewHolder?.itemView?.setBackgroundResource(R.drawable.highlight_background) // Necesitas crear este drawable
            viewHolder?.itemView?.postDelayed({
                viewHolder.itemView.setBackgroundResource(0) // Remover el resaltado después de un tiempo
            }, 1000)
        }
    }

    /**
     * Actualiza la visibilidad del TextView de "No hay médicos".
     */
    private fun updateNoDoctorsVisibility() {
        // Se basa en la lista que está visible en el adaptador, no en la gira.doctors original.
        if (doctorAdapter.itemCount == 0) {
            tvNoDoctors.visibility = View.VISIBLE
            recyclerViewDoctors.visibility = View.GONE
        } else {
            tvNoDoctors.visibility = View.GONE
            recyclerViewDoctors.visibility = View.VISIBLE
        }
    }

    /**
     * Filtra la lista de médicos/farmacias mostrada en el RecyclerView
     * según el estado de visita seleccionado en el RadioGroup y el texto de búsqueda.
     */
    private fun filterDoctors() {
        val searchTerm = etSearchClient.text.toString().trim().lowercase()
        val filteredList = gira.doctors.filter { doctor ->
            val matchesSearch = doctor.name.lowercase().contains(searchTerm) ||
                    doctor.location.lowercase().contains(searchTerm) ||
                    doctor.phoneNumber.lowercase().contains(searchTerm)
            when (radioGroupFilter.checkedRadioButtonId) {
                R.id.rb_visited_clients -> doctor.isVisited && matchesSearch
                R.id.rb_not_visited_clients -> !doctor.isVisited && matchesSearch
                else -> matchesSearch // R.id.rb_all_clients o ningún seleccionado
            }
        }.toMutableList()
        doctorAdapter.updateDoctors(filteredList) // Método en el adaptador para actualizar la lista visible
        updateNoDoctorsVisibility() // Actualizar visibilidad después de filtrar
    }

    /**
     * Actualiza el estado de visita de un DoctorPharmacy y lo persiste en la base de datos.
     */
    private fun updateDoctorVisitedStatus(doctor: DoctorPharmacy, isVisited: Boolean) {
        // Encuentra el doctor en la lista original de la gira y actualiza su estado
        gira.doctors.find { it.id == doctor.id }?.let { foundDoctor ->
            foundDoctor.isVisited = isVisited
            lifecycleScope.launch(Dispatchers.IO) {
                database.giraDao().updateGira(gira) // Guarda la gira actualizada
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "${foundDoctor.name} marcado como ${if (isVisited) "Visitado" else "No Visitado"}", Toast.LENGTH_SHORT).show()
                    filterDoctors() // Volver a aplicar el filtro para que la lista se actualice correctamente
                }
            }
        }
    }

    /**
     * Muestra un diálogo para agregar o editar un nuevo médico o farmacia.
     * @param doctor La instancia de DoctorPharmacy a editar, o null si se va a agregar uno nuevo.
     */
    private fun showAddDoctorDialog(doctor: DoctorPharmacy?) {
        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_add_doctor, null)
        val etName = dialogView.findViewById<EditText>(R.id.et_doctor_name)
        val etLocation = dialogView.findViewById<EditText>(R.id.et_doctor_location)
        val btnSelectLocationMap = dialogView.findViewById<ImageView>(R.id.btn_select_location_map)
        val etPhone = dialogView.findViewById<EditText>(R.id.et_doctor_phone)
        val switchBuys = dialogView.findViewById<Switch>(R.id.switch_doctor_buys)
        val btnSelectMedications = dialogView.findViewById<Button>(R.id.btn_select_medications)
        val tvSelectedMedications = dialogView.findViewById<TextView>(R.id.tv_selected_medications)

        etLocationInDialog = etLocation // Asigna el EditText para poder actualizarlo desde el launcher

        val isEditing = doctor != null
        if (isEditing) {
            etName.setText(doctor?.name)
            etLocation.setText(doctor?.location)
            etPhone.setText(doctor?.phoneNumber)
            switchBuys.isChecked = doctor?.buys ?: false
            selectedOrderItems = doctor?.orderedItems?.toMutableList() ?: mutableListOf()

            // Cargar los nombres de los medicamentos para mostrarlos
            lifecycleScope.launch(Dispatchers.IO) { // Se necesita un LifecycleOwner para observe
                // Obtener solo los IDs de los OrderItems
                val medicationIds = selectedOrderItems.map { it.medicationId }
                // No se puede observar LiveData directamente en un launch sin un LifecycleOwner.
                // En su lugar, se puede usar firstOrNull() para obtener el valor actual.
                // Corrección: LiveData.value puede ser null si no se ha cargado aún. Usar con precaución o un método suspendido si es posible.
                // Para este caso, MedicationPickerActivity ya devuelve los nombres, así que podemos confiar en eso si no cambian los items.
                // Sin embargo, para inicializar el diálogo con nombres correctos, hacemos la consulta.
                val medicationsInDb = database.medicationDao().getAllMedications().value // Acceso al valor actual de LiveData
                val names = selectedOrderItems.mapNotNull { orderItem ->
                    medicationsInDb?.find { it.id == orderItem.medicationId }?.name
                }.toMutableList()

                withContext(Dispatchers.Main) {
                    selectedMedicationNamesForDisplay = names
                    tvSelectedMedications.text = if (selectedMedicationNamesForDisplay.isNotEmpty()) {
                        "Pedidos: ${selectedMedicationNamesForDisplay.joinToString(", ")}"
                    } else {
                        "Ningún medicamento seleccionado"
                    }
                    tvSelectedMedications.visibility = View.VISIBLE
                }
            }
        } else {
            selectedOrderItems.clear() // Limpiar para una nueva entrada
            selectedMedicationNamesForDisplay.clear()
            tvSelectedMedications.text = "Ningún medicamento seleccionado"
            tvSelectedMedications.visibility = View.GONE
        }


        btnSelectLocationMap.setOnClickListener {
            val intent = Intent(requireContext(), MapPickerActivity::class.java)
            mapPickerLauncher.launch(intent)
        }

        btnSelectMedications.setOnClickListener {
            // Lanza la actividad para seleccionar medicamentos, pasando los ya seleccionados
            val intent = Intent(requireContext(), MedicationPickerActivity::class.java).apply {
                putExtra("initial_selected_order_items", ArrayList(selectedOrderItems))
            }
            medicationPickerLauncher.launch(intent)
        }


        AlertDialog.Builder(requireContext())
            .setTitle(if (isEditing) "Editar Médico/Farmacia" else "Agregar Médico/Farmacia")
            .setView(dialogView)
            .setPositiveButton(if (isEditing) "Guardar Cambios" else "Agregar") { dialog, _ ->
                val name = etName.text.toString().trim()
                val location = etLocation.text.toString().trim()
                val phone = etPhone.text.toString().trim()
                val buys = switchBuys.isChecked

                if (name.isNotEmpty() && location.isNotEmpty() && phone.isNotEmpty()) {
                    // Calcular el outstandingBalance basado en los orderedItems seleccionados
                    val calculatedOutstandingBalance = selectedOrderItems.sumOf { it.quantity * it.customPrice }

                    lifecycleScope.launch(Dispatchers.IO) {
                        if (isEditing) {
                            doctor?.apply {
                                this.name = name
                                this.location = location
                                this.phoneNumber = phone
                                this.buys = buys
                                this.orderedItems = selectedOrderItems // Actualizar OrderItems
                                this.outstandingBalance = calculatedOutstandingBalance // Actualizar balance
                                // No cambiamos isVisited en este diálogo, se cambia con el checkbox en la lista
                                database.giraDao().updateGira(gira) // Actualizar la gira padre
                            }
                            withContext(Dispatchers.Main) {
                                Toast.makeText(context, "$name actualizado exitosamente", Toast.LENGTH_SHORT).show()
                                filterDoctors() // Vuelve a aplicar el filtro para refrescar
                            }
                        } else {
                            // Al crear un nuevo doctor, el outstandingBalance inicia con el valor calculado
                            // isVisited por defecto es false
                            val newDoctor = DoctorPharmacy(UUID.randomUUID().toString(), name, location, phone, buys, selectedOrderItems, calculatedOutstandingBalance)
                            gira.doctors.add(newDoctor)
                            database.giraDao().updateGira(gira) // Guardar la gira actualizada
                            withContext(Dispatchers.Main) {
                                Toast.makeText(context, "$name agregado exitosamente.", Toast.LENGTH_SHORT).show()
                                filterDoctors() // Vuelve a aplicar el filtro para refrescar
                            }
                        }
                    }
                } else {
                    Toast.makeText(context, "Por favor, complete todos los campos", Toast.LENGTH_SHORT).show()
                }
                dialog.dismiss()
            }
            .setNegativeButton("Cancelar") { dialog, _ ->
                dialog.cancel()
            }
            .show()
    }

    /**
     * Muestra un diálogo de confirmación antes de eliminar un médico/farmacia.
     */
    private fun confirmDeleteDoctorPharmacy(doctor: DoctorPharmacy) {
        AlertDialog.Builder(requireContext())
            .setTitle("Confirmar Eliminación")
            .setMessage("¿Estás seguro de que quieres eliminar a '${doctor.name}' de esta gira? Esta acción no se puede deshacer.")
            .setPositiveButton("Eliminar") { dialog, _ ->
                val position = gira.doctors.indexOf(doctor)
                if (position != -1) {
                    gira.doctors.removeAt(position) // Elimina de la lista de la gira

                    // Actualizar la gira en la base de datos para persistir la lista modificada
                    lifecycleScope.launch(Dispatchers.IO) {
                        database.giraDao().updateGira(gira) // Guarda la gira actualizada
                        withContext(Dispatchers.Main) {
                            Toast.makeText(context, "'${doctor.name}' eliminado.", Toast.LENGTH_SHORT).show()
                            filterDoctors() // Vuelve a aplicar el filtro para refrescar
                        }
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
     * Abre la ubicación proporcionada en Google Maps.
     * @param locationString La cadena de ubicación (puede ser una dirección o coordenadas "lat,long").
     */
    private fun openLocationInMaps(locationString: String) {
        val gmmIntentUri = Uri.parse("geo:0,0?q=${Uri.encode(locationString)}")
        val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
        mapIntent.setPackage("com.google.android.apps.maps")

        if (mapIntent.resolveActivity(requireActivity().packageManager) != null) {
            startActivity(mapIntent)
        } else {
            val webMapIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://maps.google.com/?q=${Uri.encode(locationString)}"))
            if (webMapIntent.resolveActivity(requireActivity().packageManager) != null) {
                startActivity(webMapIntent)
            } else {
                Toast.makeText(context, "No se encontró una aplicación de mapas para abrir la ubicación.", Toast.LENGTH_LONG).show()
            }
        }
    }
}