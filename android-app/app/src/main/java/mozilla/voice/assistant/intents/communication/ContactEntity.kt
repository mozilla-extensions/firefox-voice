package mozilla.voice.assistant.intents.communication

import android.content.Context
import androidx.room.ColumnInfo
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import kotlinx.coroutines.CoroutineScope

@Entity(tableName = "contact_table")
data class ContactEntity(
    @PrimaryKey @ColumnInfo(name = "nickname") val nickname: String,
    @ColumnInfo(name = "name") val name: String,
    @ColumnInfo(name = "lookupKey") val lookupKey: String, // foreign key to phone's contact DB
    @ColumnInfo(name = "smsNumber") val smsNumber: String?,
    @ColumnInfo(name = "voiceNumber") val voiceNumber: String?
)

@Dao
interface ContactDao {
    @Query("SELECT * FROM contact_table WHERE nickname COLLATE NOCASE = :nickname")
    fun findByNickname(nickname: String): ContactEntity?

    @Query("SELECT * FROM contact_table ORDER BY nickname")
    fun findAll(): List<ContactEntity>

    @Query("DELETE FROM contact_table")
    fun deleteAll()

    @Insert
    fun insert(contact: ContactEntity)
}

@Database(entities = arrayOf(ContactEntity::class), version = 1)
abstract class ContactDatabase : RoomDatabase() {
    abstract fun contactDao(): ContactDao

    private class ContactDatabaseCallback(
        private val scope: CoroutineScope
    ) : RoomDatabase.Callback()

    // https://codelabs.developers.google.com/codelabs/android-room-with-a-view-kotlin/#6
    companion object {
        @Volatile
        private var INSTANCE: ContactDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): ContactDatabase {
            return INSTANCE
                ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    ContactDatabase::class.java,
                    "contact_database"
                )
                    .fallbackToDestructiveMigration()
                    .addCallback(
                        ContactDatabaseCallback(
                            scope
                        )
                    )
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

class ContactRepository(private val contactDao: ContactDao) {
    suspend fun get(nickname: String) =
        contactDao.findByNickname(nickname)

    suspend fun insert(contactEntity: ContactEntity) {
        contactDao.insert(contactEntity)
    }
}
