package com.example.medicalvisitcontrol.data.models

import java.io.Serializable // Para pasar el objeto entre fragmentos

data class DoctorPharmacy(
    var id: String,
    var name: String,
    var location: String, // Dirección o coordenadas (ej. "Lat,Long")
    var phoneNumber: String,
    var buys: Boolean, // Indica si este médico/farmacia realiza compras
    // Ahora orderedItems es una lista de OrderItem, no solo IDs
    var orderedItems: MutableList<OrderItem> = mutableListOf(),
    var outstandingBalance: Double = 0.0, // Saldo pendiente de cobro por este cliente
    var isVisited: Boolean = false // Nuevo campo: indica si el cliente ha sido visitado
) : Serializable