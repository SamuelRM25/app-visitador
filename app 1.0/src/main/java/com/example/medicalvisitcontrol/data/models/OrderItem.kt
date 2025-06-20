package com.example.medicalvisitcontrol.data.models

import java.io.Serializable

data class OrderItem(
    val medicationId: String,
    var quantity: Int,
    var customPrice: Double // Precio al que se vendió este medicamento en particular
) : Serializable