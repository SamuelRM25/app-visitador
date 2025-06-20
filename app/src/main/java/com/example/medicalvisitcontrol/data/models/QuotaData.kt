package com.example.medicalvisitcontrol.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "QuotaData")
data class QuotaData(
    @PrimaryKey(autoGenerate = false) val id: Int = 1, // Siempre tendrá un solo registro con ID 1
    var orderQuota: Double = 0.0,
    var totalOrdersValue: Double = 0.0,
    var collectionQuota: Double = 0.0,
    var totalCollectionsValue: Double = 0.0,
    var totalOutstandingOrders: Double = 0.0 // Suma de todos los outstandingBalance de DoctorPharmacy
)