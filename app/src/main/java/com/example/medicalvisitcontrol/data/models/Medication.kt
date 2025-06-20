package com.example.medicalvisitcontrol.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.io.Serializable

@Entity(tableName = "medications")
data class Medication(
    @PrimaryKey val id: String, // ID único del medicamento
    var name: String, // Nombre comercial del medicamento
    var molecule: String, // Molécula activa
    var presentation: String, // Presentación (ej. "Tabletas 500mg", "Jarabe 100ml")
    var price: Double, // Precio unitario
    var stock: Int, // Cantidad en inventario
    var notes: String? = null // Notas adicionales
) : Serializable
