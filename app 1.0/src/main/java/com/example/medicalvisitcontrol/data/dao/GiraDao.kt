package com.example.medicalvisitcontrol.data.dao

import androidx.lifecycle.LiveData
import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.medicalvisitcontrol.data.models.Gira

@Dao
interface GiraDao {
    @Query("SELECT * FROM giras ORDER BY name ASC")
    fun getAllGiras(): LiveData<MutableList<Gira>> // Mantiene la función existente para LiveData

    // ¡NUEVO MÉTODO SUSPENDIDO para obtener datos directos!
    @Query("SELECT * FROM giras ORDER BY name ASC")
    suspend fun getAllGirasDirect(): List<Gira> // Para obtener datos una sola vez en un contexto suspendido

    @Query("SELECT * FROM giras WHERE id = :giraId")
    suspend fun getGiraById(giraId: String): Gira?

    @Insert(onConflict = OnConflictStrategy.REPLACE) // Inserta o reemplaza si hay conflicto (por ID)
    suspend fun insertGira(gira: Gira)

    @Update
    suspend fun updateGira(gira: Gira)

    @Delete
    suspend fun deleteGira(gira: Gira)

    @Query("DELETE FROM giras")
    suspend fun deleteAllGiras()
}
