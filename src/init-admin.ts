import {EEventsAppApplication} from './application';
import {UserRepository} from './repositories';
import * as bcrypt from 'bcryptjs';

async function createDefaultAdmin() {
  const app = new EEventsAppApplication();
  await app.boot();

  const userRepository = await app.getRepository(UserRepository);

  // Vérifier si un admin existe déjà
  const existingAdmin = await userRepository.findOne({
    where: {role: 'admin'},
  });

  if (existingAdmin) {
    console.log('✅ Un administrateur existe déjà dans la base de données');
    console.log(`   Username: ${existingAdmin.username}`);
    process.exit(0);
  }

  // Créer l'admin par défaut
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await userRepository.create({
    prenom: 'Admin',
    nom: 'Principal',
    telephone: '237690000000',
    username: 'admin',
    password: hashedPassword,
    email: 'admin@e-events.com',
    role: 'admin',
    createdAt: new Date(),
  });

  console.log('✅ Administrateur par défaut créé avec succès !');
  console.log('');
  console.log('📋 Informations de connexion :');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('');
  console.log('⚠️  IMPORTANT: Changez ce mot de passe après la première connexion !');

  process.exit(0);
}

createDefaultAdmin().catch(err => {
  console.error('❌ Erreur lors de la création de l\'administrateur:', err);
  process.exit(1);
});
