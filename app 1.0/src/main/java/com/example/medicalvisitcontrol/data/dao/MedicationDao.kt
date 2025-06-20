package com.example.medicalvisitcontrol.data.dao

import androidx.lifecycle.LiveData
import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.medicalvisitcontrol.data.models.Medication

@Dao
interface MedicationDao {
    @Query("SELECT * FROM medications ORDER BY name ASC")
    fun getAllMedications(): LiveData<MutableList<Medication>> // Mantiene la función existente para LiveData

    // ¡NUEVO MÉTODO SUSPENDIDO para obtener datos directos!
    @Query("SELECT * FROM medications ORDER BY name ASC")
    suspend fun getAllMedicationsDirect(): List<Medication> // Para obtener datos una sola vez en un contexto suspendido

    @Query("SELECT * FROM medications WHERE id = :medicationId")
    suspend fun getMedicationById(medicationId: String): Medication?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMedication(medication: Medication)

    @Update
    suspend fun updateMedication(medication: Medication)

    @Delete
    suspend fun deleteMedication(medication: Medication)

    // Consultas para obtener medicamentos por lista de IDs (útil para pedidos)
    @Query("SELECT * FROM medications WHERE id IN (:medicationIds)")
    fun getMedicationsByIds(medicationIds: List<String>): LiveData<MutableList<Medication>>

    @Query("DELETE FROM medications")
    suspend fun deleteAllMedications()
}
