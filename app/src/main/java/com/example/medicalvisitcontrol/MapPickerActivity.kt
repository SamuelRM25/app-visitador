package com.example.medicalvisitcontrol.ui.medicalvisits

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log // Importar Log
import android.widget.Toast // Importar Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat // Importar ContextCompat
import com.example.medicalvisitcontrol.R
import android.Manifest // Importar Manifest

class MapPickerActivity : AppCompatActivity() {

    private val TAG = "MapPickerActivity"
    private val requestPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
            if (permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true) {
                // Permiso concedido, carga el fragmento del mapa
                loadMapFragment()
            } else {
                // Permiso denegado, muestra un mensaje y cierra
                Toast.makeText(this, "Permiso de ubicación denegado. No se puede mostrar el mapa.", Toast.LENGTH_LONG).show()
                finish()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_map_picker)

        // Verifica y solicita permisos de ubicación si es necesario
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            // Permisos ya concedidos, carga el fragmento del mapa
            loadMapFragment()
        } else {
            // Solicita permisos de ubicación
            requestPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    private fun loadMapFragment() {
        if (supportFragmentManager.findFragmentById(R.id.map_container) == null) {
            try {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.map_container, MapPickerFragment())
                    .commit()
            } catch (e: Exception) {
                Log.e(TAG, "Error al cargar MapPickerFragment: ${e.message}", e)
                Toast.makeText(this, "Error al cargar el mapa: ${e.message}", Toast.LENGTH_LONG).show()
                finish()
            }
        }
    }
}