package com.example.medicalvisitcontrol.data.converters

import androidx.room.TypeConverter
import com.example.medicalvisitcontrol.data.models.DoctorPharmacy
import com.example.medicalvisitcontrol.data.models.OrderItem
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

class Converters {
    private val gson = Gson()

    @TypeConverter
    fun fromDoctorPharmacyList(value: MutableList<DoctorPharmacy>): String {
        return gson.toJson(value)
    }

    @TypeConverter
    fun toDoctorPharmacyList(value: String): MutableList<DoctorPharmacy> {
        val type = object : TypeToken<MutableList<DoctorPharmacy>>() {}.type
        return gson.fromJson(value, type)
    }

    @TypeConverter
    fun fromStringList(value: MutableList<String>): String {
        return gson.toJson(value)
    }

    @TypeConverter
    fun toStringList(value: String): MutableList<String> {
        val type = object : TypeToken<MutableList<String>>() {}.type
        return gson.fromJson(value, type)
    }

    @TypeConverter
    fun fromOrderItemList(value: MutableList<OrderItem>): String {
        return gson.toJson(value)
    }

    @TypeConverter
    fun toOrderItemList(value: String): MutableList<OrderItem> {
        val type = object : TypeToken<MutableList<OrderItem>>() {}.type
        return gson.fromJson(value, type)
    }
}