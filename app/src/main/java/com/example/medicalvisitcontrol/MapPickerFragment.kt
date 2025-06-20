package com.example.medicalvisitcontrol.ui.medicalvisits

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager // Importar PackageManager
import android.os.Bundle
import android.util.Log // Importar Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.example.medicalvisitcontrol.R
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.google.android.gms.maps.model.Marker
import androidx.core.content.ContextCompat // Importar ContextCompat
import android.Manifest // Importar Manifest

class MapPickerFragment : Fragment(), OnMapReadyCallback {

    private lateinit var googleMap: GoogleMap
    private var selectedLatLng: LatLng? = null
    private var currentMarker: Marker? = null // Para mantener una referencia al marcador actual
    private val TAG = "MapPickerFragment" // Etiqueta para Logcat

    companion object {
        const val RESULT_OK = Activity.RESULT_OK
        const val EXTRA_SELECTED_LAT = "selected_latitude"
        const val EXTRA_SELECTED_LNG = "selected_longitude"
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_map_picker, container, false)

        try {
            val mapFragment = childFragmentManager.findFragmentById(R.id.map) as SupportMapFragment?
            mapFragment?.getMapAsync(this) // Obtiene el mapa asincrónicamente
        } catch (e: Exception) {
            Log.e(TAG, "Error al obtener GoogleMap: ${e.message}", e)
            Toast.makeText(context, "Error al cargar el mapa: ${e.message}", Toast.LENGTH_LONG).show()
        }


        val btnSelectLocation: Button = view.findViewById(R.id.btn_select_location)
        btnSelectLocation.setOnClickListener {
            selectedLatLng?.let { latLng ->
                // Devuelve la ubicación seleccionada a la actividad anterior
                val resultIntent = Intent().apply {
                    putExtra(EXTRA_SELECTED_LAT, latLng.latitude)
                    putExtra(EXTRA_SELECTED_LNG, latLng.longitude)
                }
                requireActivity().setResult(RESULT_OK, resultIntent)
                requireActivity().finish() // Cierra esta actividad
            } ?: run {
                Toast.makeText(context, "Por favor, selecciona una ubicación en el mapa.", Toast.LENGTH_SHORT).show()
            }
        }

        return view
    }

    override fun onMapReady(map: GoogleMap) {
        googleMap = map

        try {
            // Mueve la cámara a una ubicación predeterminada (por ejemplo, Ciudad de Guatemala)
            val guatemalaCity = LatLng(14.6349, -90.5069)
            googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(guatemalaCity, 10f)) // Zoom inicial

            // Habilita la capa de "Mi ubicación" si el permiso está concedido (muestra el punto azul del usuario)
            // Se necesita el permiso ACCESS_FINE_LOCATION o ACCESS_COARSE_LOCATION
            if (context?.let { ContextCompat.checkSelfPermission(it, Manifest.permission.ACCESS_FINE_LOCATION) } == PackageManager.PERMISSION_GRANTED ||
                context?.let { ContextCompat.checkSelfPermission(it, Manifest.permission.ACCESS_COARSE_LOCATION) } == PackageManager.PERMISSION_GRANTED) {
                googleMap.isMyLocationEnabled = true
            }


            // Configura el listener para cuando el usuario toca el mapa
            googleMap.setOnMapClickListener { latLng ->
                selectedLatLng = latLng
                // Elimina el marcador anterior si existe
                currentMarker?.remove()
                // Añade un nuevo marcador en la ubicación seleccionada
                currentMarker = googleMap.addMarker(
                    MarkerOptions()
                        .position(latLng)
                        .title("Ubicación Seleccionada")
                )
                Toast.makeText(context, "Ubicación seleccionada: ${latLng.latitude}, ${latLng.longitude}", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error en onMapReady: ${e.message}", e)
            Toast.makeText(context, "Error al configurar el mapa: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
}