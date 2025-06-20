package com.example.medicalvisitcontrol.data.dao

import androidx.lifecycle.LiveData
import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.medicalvisitcontrol.data.models.QuotaData

@Dao
interface QuotaDao {
    @Query("SELECT * FROM QuotaData LIMIT 1")
    fun getQuotaData(): LiveData<QuotaData?> // Mantiene la función existente para LiveData

    // ¡NUEVO MÉTODO SUSPENDIDO para obtener datos directos!
    @Query("SELECT * FROM QuotaData LIMIT 1")
    suspend fun getQuotaDataDirect(): QuotaData? // Para obtener datos una sola vez en un contexto suspendido

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuotaData(quotaData: QuotaData)

    @Update
    suspend fun updateQuotaData(quotaData: QuotaData)

    @Query("DELETE FROM QuotaData")
    suspend fun deleteAllQuotaData()
}
