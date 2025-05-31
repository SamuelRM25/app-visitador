const bcrypt = require('bcryptjs');

async function generateHash() {
    const plainPassword = 'Samprs258'; // <--- Tu contraseña plana
    const saltRounds = 10; // Un número entre 10 y 12 es común para saltRounds

    try {
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        console.log('Contraseña plana:', plainPassword);
        console.log('Contraseña hasheada (para tu DB):', hashedPassword);
    } catch (error) {
        console.error('Error al hashear la contraseña:', error);
    }
}

generateHash();