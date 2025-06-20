package com.example.medicalvisitcontrol

import android.os.Bundle
import android.util.Log // Importar la clase Log
import android.widget.Toast // Importar la clase Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import androidx.fragment.app.FragmentTransaction
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.example.medicalvisitcontrol.ui.medicalvisits.MedicalVisitsFragment // Importación añadida
import com.example.medicalvisitcontrol.ui.warehouse.WarehouseFragment // Importación añadida
import com.example.medicalvisitcontrol.ui.quotas.QuotaFragment // Asegúrate de que esta línea esté presente
import com.example.medicalvisitcontrol.ui.dashboard.DashboardFragment // Descomentar cuando exista
import com.example.medicalvisitcontrol.ui.settings.SettingsFragment // Descomentar cuando exista

class MainActivity : AppCompatActivity() {

    private lateinit var bottomNavigationView: BottomNavigationView
    private val TAG = "MainActivityError" // Etiqueta para el Logcat

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        try {
            // Establece el layout de la actividad principal
            setContentView(R.layout.activity_main)

            // Inicializa la barra de navegación inferior
            bottomNavigationView = findViewById(R.id.bottom_navigation)

            // Configura el listener para los clics en los elementos de la barra de navegación
            bottomNavigationView.setOnItemSelectedListener { item ->
                val selectedFragment: Fragment? = when (item.itemId) {
                    R.id.nav_dashboard -> DashboardFragment()
                    R.id.nav_medical_visits -> MedicalVisitsFragment()
                    R.id.nav_warehouse -> WarehouseFragment()
                    R.id.nav_quotas -> QuotaFragment() // Corregido: QuotasFragment() a QuotaFragment()
                    R.id.nav_settings -> SettingsFragment()
                    else -> null
                }

                // Carga el fragmento seleccionado
                selectedFragment?.let {
                    loadFragment(it)
                }
                true // Indica que el evento ha sido consumido
            }

            // Carga el fragmento del Dashboard por defecto al iniciar la actividad
            if (savedInstanceState == null) {
                bottomNavigationView.selectedItemId = R.id.nav_dashboard
            }
        } catch (e: Exception) {
            // Captura cualquier excepción que ocurra durante la creación de la actividad
            Log.e(TAG, "Error en onCreate de MainActivity: ${e.message}", e) // Imprime el error completo en Logcat
            Toast.makeText(this, "Error al iniciar la aplicación: ${e.message}", Toast.LENGTH_LONG).show() // Muestra un Toast al usuario
            // Opcional: podrías mostrar un diálogo de error más robusto aquí
        }
    }

    /**
     * Carga un fragmento en el FrameLayout contenedor.
     * @param fragment El fragmento a cargar.
     */
    private fun loadFragment(fragment: Fragment) {
        val fragmentManager: FragmentManager = supportFragmentManager
        val fragmentTransaction: FragmentTransaction = fragmentManager.beginTransaction()
        // Reemplaza el contenido del FrameLayout con el nuevo fragmento
        // Se eliminó el tercer argumento 'QuotaFragment()' ya que no es un tag de String válido para esta sobrecarga de replace.
        fragmentTransaction.replace(R.id.fragment_container, fragment)
        fragmentTransaction.commit() // Confirma la transacción
    }
}
