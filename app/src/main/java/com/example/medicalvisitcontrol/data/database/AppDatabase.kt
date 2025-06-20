package com.example.medicalvisitcontrol.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.medicalvisitcontrol.data.converters.Converters
import com.example.medicalvisitcontrol.data.dao.GiraDao
import com.example.medicalvisitcontrol.data.dao.MedicationDao
import com.example.medicalvisitcontrol.data.dao.QuotaDao
import com.example.medicalvisitcontrol.data.models.Gira
import com.example.medicalvisitcontrol.data.models.Medication
import com.example.medicalvisitcontrol.data.models.QuotaData
import com.google.gson.GsonBuilder
// kotlinx.coroutines.flow.firstOrNull y androidx.lifecycle.LiveData ya no son necesarios aquí para getAllDataForExport
// si los DAOs proporcionan métodos suspendidos directos.

// Importante: La VERSIÓN DE LA BASE DE DATOS SE HA INCREMENTADO A 5.
// y se ha añadido fallbackToDestructiveMigration para manejar cambios de esquema durante el desarrollo.
@Database(entities = [Gira::class, Medication::class, QuotaData::class], version = 5, exportSchema = false) // <--- ¡VERSIÓN CAMBIADA A 5!
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {

    abstract fun giraDao(): GiraDao
    abstract fun medicationDao(): MedicationDao
    abstract fun quotaDao(): QuotaDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "medical_visit_control_db" // Nombre de la base de datos
                )
                    .fallbackToDestructiveMigration() // Permite destruir y recrear la BD en caso de cambios de esquema
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }

    /**
     * Exporta todos los datos de la base de datos (Giras, Medicamentos, Cuotas) a una cadena JSON.
     * Este método debe ser llamado desde un coroutine o un hilo en segundo plano.
     * Asume que los DAOs tienen métodos 'suspend' para obtener los datos directamente.
     */
    suspend fun getAllDataForExport(): String {
        // Llama a los nuevos métodos suspendidos en tus DAOs
        val giras = giraDao().getAllGirasDirect() // Necesitas añadir este método a GiraDao
        val medications = medicationDao().getAllMedicationsDirect() // Necesitas añadir este método a MedicationDao
        val quotaData = quotaDao().getQuotaDataDirect() // Necesitas añadir este método a QuotaDao

        // Crear una clase auxiliar para la estructura de exportación
        data class ExportData(
            val giras: List<Gira>,
            val medications: List<Medication>,
            val quotaData: QuotaData?
        )

        val dataToExport = ExportData(giras, medications, quotaData)

        // Usar GsonBuilder para formatear el JSON con indentación para mejor legibilidad
        val gson = GsonBuilder().setPrettyPrinting().create()
        return gson.toJson(dataToExport)
    }
}
