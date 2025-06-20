package com.example.medicalvisitcontrol.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.io.Serializable // Para pasar el objeto entre fragmentos

@Entity(tableName = "giras")
data class Gira(
    @PrimaryKey val id: String, // Usamos String como PrimaryKey para mantener UUID
    var name: String,
    var description: String,
    // La lista de doctors se manejará con TypeConverter para Room
    val doctors: MutableList<DoctorPharmacy> = mutableListOf()
) : Serializable