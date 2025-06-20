// Archivo: app/src/main/java/com/example/medicalvisitcontrol/ui/settings/SettingsFragment.kt
// Descripción: Fragmento para la configuración de la aplicación, incluyendo la opción de exportar datos.

package com.example.medicalvisitcontrol.ui.settings

import android.Manifest
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar // ¡IMPORTACIÓN AÑADIDA!
import android.widget.Switch
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.medicalvisitcontrol.R
import com.example.medicalvisitcontrol.data.database.AppDatabase
import com.example.medicalvisitcontrol.data.models.Gira
import com.example.medicalvisitcontrol.data.models.Medication
import com.example.medicalvisitcontrol.data.models.QuotaData
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.JsonSyntaxException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.Serializable // Necesario para AppDataBackup

// Data class para envolver todos los datos de la app para exportación/importación
data class AppDataBackup(
    val giras: List<Gira>,
    val medications: List<Medication>,
    val quotaData: QuotaData? // Puede ser nulo si aún no se ha inicializado
) : Serializable

class SettingsFragment : Fragment() {

    private lateinit var database: AppDatabase
    private lateinit var gson: Gson
    private val TAG = "SettingsFragment"

    // UI elements - Data Management
    private lateinit var btnExportData: Button
    private lateinit var etImportData: EditText
    private lateinit var btnImportData: Button
    private lateinit var tvImportExportInfo: TextView
    private lateinit var progressBarExportImport: ProgressBar // ProgressBar para exportar/importar

    // UI elements - Other Settings
    private lateinit var switchNotifications: Switch
    private lateinit var switchTheme: Switch
    private lateinit var btnManagePermissions: Button
    private lateinit var btnAboutApp: Button

    // Request permission launcher
    private val requestPermissionLauncher = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
        val granted = permissions.entries.all { it.value }
        if (granted) {
            Toast.makeText(context, "Todos los permisos necesarios concedidos.", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(context, "Algunos permisos fueron denegados. La funcionalidad podría verse afectada.", Toast.LENGTH_LONG).show()
        }
    }


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        database = AppDatabase.getDatabase(requireContext())
        // Usar GsonBuilder para permitir la serialización/deserialización de objetos con valores nulos
        gson = GsonBuilder().setPrettyPrinting().create()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        try {
            val view = inflater.inflate(R.layout.fragment_settings, container, false)

            // Initialize UI elements - Data Management
            btnExportData = view.findViewById(R.id.btn_export_data)
            etImportData = view.findViewById(R.id.et_import_data)
            btnImportData = view.findViewById(R.id.btn_import_data)
            tvImportExportInfo = view.findViewById(R.id.tv_import_export_info)
            progressBarExportImport = view.findViewById(R.id.progress_bar_export_import) // Inicializar ProgressBar

            // Initialize UI elements - Other Settings
            switchNotifications = view.findViewById(R.id.switch_notifications)
            switchTheme = view.findViewById(R.id.switch_theme)
            btnManagePermissions = view.findViewById(R.id.btn_manage_permissions)
            btnAboutApp = view.findViewById(R.id.btn_about_app)

            setupListeners()
            loadSettings() // Cargar las configuraciones guardadas
            updateImportExportInfo()

            return view
        } catch (e: Exception) {
            Log.e(TAG, "Error en onCreateView de SettingsFragment: ${e.message}", e)
            Toast.makeText(requireContext(), "Error al cargar la pantalla de Configuración. Revisa el Logcat.", Toast.LENGTH_LONG).show()
            return null
        }
    }

    private fun setupListeners() {
        // Data Management Listeners
        btnExportData.setOnClickListener {
            exportDataToClipboard()
        }

        btnImportData.setOnClickListener {
            confirmImportData()
        }

        // Other Settings Listeners
        switchNotifications.setOnCheckedChangeListener { _, isChecked ->
            saveNotificationPreference(isChecked)
        }

        switchTheme.setOnCheckedChangeListener { _, isChecked ->
            saveThemePreference(isChecked)
        }

        btnManagePermissions.setOnClickListener {
            checkAndRequestPermissions()
        }

        btnAboutApp.setOnClickListener {
            showAboutAppDialog()
        }
    }

    /**
     * Carga las preferencias guardadas (notificaciones, tema) al iniciar el fragmento.
     */
    private fun loadSettings() {
        val prefs = requireActivity().getSharedPreferences("AppSettings", Context.MODE_PRIVATE)

        val notificationsEnabled = prefs.getBoolean("notifications_enabled", true)
        switchNotifications.isChecked = notificationsEnabled

        val currentNightMode = AppCompatDelegate.getDefaultNightMode()
        val isDarkTheme = currentNightMode == AppCompatDelegate.MODE_NIGHT_YES ||
                currentNightMode == AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM && resources.configuration.uiMode and android.content.res.Configuration.UI_MODE_NIGHT_MASK == android.content.res.Configuration.UI_MODE_NIGHT_YES
        switchTheme.isChecked = isDarkTheme
    }

    /**
     * Guarda la preferencia de notificación en SharedPreferences.
     */
    private fun saveNotificationPreference(enabled: Boolean) {
        val prefs = requireActivity().getSharedPreferences("AppSettings", Context.MODE_PRIVATE)
        prefs.edit().putBoolean("notifications_enabled", enabled).apply()
        Toast.makeText(context, "Preferencias de notificación guardadas.", Toast.LENGTH_SHORT).show()
        // Aquí podrías integrar un sistema de notificaciones real
    }

    /**
     * Guarda la preferencia de tema (claro/oscuro) en SharedPreferences y aplica el tema.
     */
    private fun saveThemePreference(isDarkTheme: Boolean) {
        val prefs = requireActivity().getSharedPreferences("AppSettings", Context.MODE_PRIVATE)
        prefs.edit().putBoolean("dark_theme_enabled", isDarkTheme).apply()

        if (isDarkTheme) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
        } else {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
        }
        // Recrear la actividad para aplicar el tema inmediatamente
        requireActivity().recreate()
    }

    /**
     * Exporta todos los datos de la base de datos a un formato JSON y lo copia al portapapeles.
     */
    private fun exportDataToClipboard() {
        progressBarExportImport.visibility = View.VISIBLE // Mostrar ProgressBar
        btnExportData.isEnabled = false // Deshabilitar botón
        btnImportData.isEnabled = false // Deshabilitar botón de importar también

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                // Modificado para usar el método getAllDataForExport de AppDatabase
                val allDataJson = database.getAllDataForExport()

                withContext(Dispatchers.Main) {
                    val clipboard = requireContext().getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    val clip = ClipData.newPlainText("MedicalVisitControl_Backup", allDataJson)
                    clipboard.setPrimaryClip(clip)
                    Toast.makeText(context, "Datos exportados y copiados al portapapeles.", Toast.LENGTH_LONG).show()
                    Log.d(TAG, "Datos exportados: $allDataJson")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error al exportar datos: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Error al exportar datos: ${e.message}", Toast.LENGTH_LONG).show()
                }
            } finally {
                withContext(Dispatchers.Main) {
                    progressBarExportImport.visibility = View.GONE // Ocultar ProgressBar
                    btnExportData.isEnabled = true // Habilitar botón
                    btnImportData.isEnabled = true // Habilitar botón de importar
                }
            }
        }
    }

    /**
     * Muestra un diálogo de confirmación antes de importar datos, ya que sobrescribirá los existentes.
     */
    private fun confirmImportData() {
        val jsonInput = etImportData.text.toString().trim()
        if (jsonInput.isEmpty()) {
            Toast.makeText(context, "Por favor, pega los datos JSON para importar.", Toast.LENGTH_SHORT).show()
            return
        }

        AlertDialog.Builder(requireContext())
            .setTitle("Confirmar Importación de Datos")
            .setMessage("¡ADVERTENCIA! Esta acción SOBRESCRIBIRÁ TODOS tus datos actuales (Giras, Médicos/Farmacias, Medicamentos y Cuotas). ¿Estás seguro de que quieres continuar?")
            .setPositiveButton("Importar y Sobrescribir") { dialog, _ ->
                importDataFromJson(jsonInput)
                dialog.dismiss()
            }
            .setNegativeButton("Cancelar") { dialog, _ ->
                dialog.cancel()
            }
            .show()
    }

    /**
     * Importa datos desde una cadena JSON y los guarda en la base de datos, sobrescribiendo los existentes.
     * @param jsonString La cadena JSON que contiene los datos de respaldo.
     */
    private fun importDataFromJson(jsonString: String) {
        progressBarExportImport.visibility = View.VISIBLE // Mostrar ProgressBar
        btnExportData.isEnabled = false // Deshabilitar botón
        btnImportData.isEnabled = false // Deshabilitar botón de importar

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val appData = gson.fromJson(jsonString, AppDataBackup::class.java)

                // Limpiar todas las tablas existentes antes de importar
                database.giraDao().deleteAllGiras()
                database.medicationDao().deleteAllMedications()
                database.quotaDao().deleteAllQuotaData()

                // Insertar los nuevos datos
                appData.giras.forEach { database.giraDao().insertGira(it) }
                appData.medications.forEach { database.medicationDao().insertMedication(it) }
                appData.quotaData?.let { database.quotaDao().insertQuotaData(it) }

                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Datos importados exitosamente.", Toast.LENGTH_LONG).show()
                    etImportData.setText("") // Limpiar el campo de texto
                    updateImportExportInfo()
                }
            } catch (e: JsonSyntaxException) {
                Log.e(TAG, "Error de sintaxis JSON al importar: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Error al importar datos: Formato JSON inválido.", Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error general al importar datos: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Error al importar datos: ${e.message}", Toast.LENGTH_LONG).show()
                }
            } finally {
                withContext(Dispatchers.Main) {
                    progressBarExportImport.visibility = View.GONE // Ocultar ProgressBar
                    btnExportData.isEnabled = true // Habilitar botón
                    btnImportData.isEnabled = true // Habilitar botón de importar
                }
            }
        }
    }

    /**
     * Verifica y solicita permisos necesarios para la aplicación.
     */
    private fun checkAndRequestPermissions() {
        val permissionsToRequest = mutableListOf<String>()

        // Ejemplo de permisos relevantes para esta app
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.WRITE_EXTERNAL_STORAGE)
        }
        if (ContextCompat.checkSelfPermission(requireContext(), Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.READ_EXTERNAL_STORAGE)
        }

        if (permissionsToRequest.isNotEmpty()) {
            requestPermissionLauncher.launch(permissionsToRequest.toTypedArray())
        } else {
            Toast.makeText(context, "Todos los permisos necesarios ya están concedidos.", Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * Muestra un diálogo con información sobre la aplicación (versión, etc.).
     */
    private fun showAboutAppDialog() {
        val versionName = try {
            val packageInfo = requireContext().packageManager.getPackageInfo(requireContext().packageName, 0)
            packageInfo.versionName
        } catch (e: PackageManager.NameNotFoundException) {
            "Desconocida"
        }

        AlertDialog.Builder(requireContext())
            .setTitle("Acerca de la Aplicación")
            .setMessage("Control de Visitas Médicas y Cuotas\n\nVersión: $versionName\n\nDesarrollado con ❤️ en 🇬🇹")
            .setPositiveButton("Aceptar") { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }


    /**
     * Actualiza la información sobre la exportación/importación (ej. última fecha de exportación).
     * Esto es un placeholder; la implementación real requeriría guardar la fecha en SharedPreferences.
     */
    private fun updateImportExportInfo() {
        // En una implementación real, aquí leerías de SharedPreferences la última fecha de exportación
        // o información relevante sobre el estado de los datos.
        tvImportExportInfo.text = "La exportación e importación de datos te permite guardar y restaurar toda la información de la aplicación (giras, médicos, medicamentos, cuotas). Usa esta función para respaldar tus datos."
    }
}
