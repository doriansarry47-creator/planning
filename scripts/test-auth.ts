#!/usr/bin/env node

/**
 * Script de test complet pour l'authentification
 * Teste tous les scénarios d'inscription et de connexion
 */

import fetch from 'node-fetch';

const API_BASE_URL = "https://5000-i2ss87xx23jkazvf1xsd4-6532622b.e2b.dev/api";

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  data?: any;
}

const results: TestResult[] = [];

// Utilitaires
function logTest(name: string, success: boolean, message: string, data?: any) {
  const emoji = success ? "✅" : "❌";
  console.log(`${emoji} ${name}: ${message}`);
  results.push({ name, success, message, data });
}

async function makeRequest(method: string, endpoint: string, data?: any, headers?: any): Promise<{ status: number, data: any }> {
  const options: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const responseData = await response.json();

  return {
    status: response.status,
    data: responseData
  };
}

// Tests
async function testHealthCheck() {
  console.log("\n🏥 Test de santé du serveur");
  try {
    const { status, data } = await makeRequest('GET', '/health');
    if (status === 200 && data.status === 'OK') {
      logTest("Health Check", true, `Serveur opérationnel - ${data.environment} avec ${data.database}`);
    } else {
      logTest("Health Check", false, `Status inattendu: ${status}`);
    }
  } catch (error) {
    logTest("Health Check", false, `Erreur de connexion: ${error}`);
  }
}

async function testPatientRegistration() {
  console.log("\n👤 Tests d'inscription patient");

  // Test inscription valide
  try {
    const { status, data } = await makeRequest('POST', '/auth/register/patient', {
      email: "testpatient@medical.fr",
      password: "TestPassword123",
      firstName: "Test",
      lastName: "Patient",
      phoneNumber: "06 12 34 56 78"
    });

    if (status === 201 && data.token) {
      logTest("Inscription Patient Valide", true, "Patient créé avec succès", { email: data.user.email });
    } else {
      logTest("Inscription Patient Valide", false, `Echec: ${data.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    logTest("Inscription Patient Valide", false, `Erreur: ${error}`);
  }

  // Test inscription avec mot de passe faible
  try {
    const { status, data } = await makeRequest('POST', '/auth/register/patient', {
      email: "faible@medical.fr",
      password: "123",
      firstName: "Mot",
      lastName: "Faible"
    });

    if (status === 400) {
      logTest("Validation Mot de passe", true, "Rejet correcte du mot de passe faible");
    } else {
      logTest("Validation Mot de passe", false, "Devrait rejeter un mot de passe faible");
    }
  } catch (error) {
    logTest("Validation Mot de passe", false, `Erreur: ${error}`);
  }

  // Test inscription avec email déjà utilisé
  try {
    const { status, data } = await makeRequest('POST', '/auth/register/patient', {
      email: "patient@test.fr", // Email existant
      password: "TestPassword123",
      firstName: "Duplicata",
      lastName: "Test"
    });

    if (status === 400 && data.error.includes("déjà utilisé")) {
      logTest("Email Duplicata", true, "Rejet correct de l'email existant");
    } else {
      logTest("Email Duplicata", false, "Devrait rejeter un email existant");
    }
  } catch (error) {
    logTest("Email Duplicata", false, `Erreur: ${error}`);
  }
}

async function testPatientLogin() {
  console.log("\n🔐 Tests de connexion patient");

  // Test connexion valide avec compte existant
  try {
    const { status, data } = await makeRequest('POST', '/auth/login/patient', {
      email: "patient@test.fr",
      password: "patient123"
    });

    if (status === 200 && data.token) {
      logTest("Connexion Patient Valide", true, "Connexion réussie", { 
        user: data.user.firstName + " " + data.user.lastName 
      });
      return data.token; // Retourner le token pour les tests suivants
    } else {
      logTest("Connexion Patient Valide", false, `Echec: ${data.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    logTest("Connexion Patient Valide", false, `Erreur: ${error}`);
  }

  // Test connexion avec mauvais mot de passe
  try {
    const { status, data } = await makeRequest('POST', '/auth/login/patient', {
      email: "patient@test.fr",
      password: "mauvais_motdepasse"
    });

    if (status === 401) {
      logTest("Mauvais Mot de passe", true, "Rejet correct du mauvais mot de passe");
    } else {
      logTest("Mauvais Mot de passe", false, "Devrait rejeter un mauvais mot de passe");
    }
  } catch (error) {
    logTest("Mauvais Mot de passe", false, `Erreur: ${error}`);
  }

  // Test connexion avec email inexistant
  try {
    const { status, data } = await makeRequest('POST', '/auth/login/patient', {
      email: "inexistant@test.fr",
      password: "motdepasse"
    });

    if (status === 401) {
      logTest("Email Inexistant", true, "Rejet correct de l'email inexistant");
    } else {
      logTest("Email Inexistant", false, "Devrait rejeter un email inexistant");
    }
  } catch (error) {
    logTest("Email Inexistant", false, `Erreur: ${error}`);
  }

  return null;
}

async function testAdminRegistration() {
  console.log("\n👨‍💼 Tests d'inscription admin");

  // Test inscription admin valide
  try {
    const { status, data } = await makeRequest('POST', '/auth/register/admin', {
      username: "testadmin",
      email: "testadmin@medical.fr",
      password: "AdminPassword123",
      fullName: "Test Administrateur",
      role: "admin"
    });

    if (status === 201 && data.token) {
      logTest("Inscription Admin Valide", true, "Admin créé avec succès", { 
        email: data.user.email,
        username: data.user.username 
      });
    } else {
      logTest("Inscription Admin Valide", false, `Echec: ${data.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    logTest("Inscription Admin Valide", false, `Erreur: ${error}`);
  }

  // Test inscription avec email admin déjà utilisé
  try {
    const { status, data } = await makeRequest('POST', '/auth/register/admin', {
      username: "admin2",
      email: "admin@medical.fr", // Email existant
      password: "AdminPassword123",
      fullName: "Admin Duplicata",
      role: "admin"
    });

    if (status === 400 && data.error.includes("déjà utilisé")) {
      logTest("Email Admin Duplicata", true, "Rejet correct de l'email admin existant");
    } else {
      logTest("Email Admin Duplicata", false, "Devrait rejeter un email admin existant");
    }
  } catch (error) {
    logTest("Email Admin Duplicata", false, `Erreur: ${error}`);
  }
}

async function testAdminLogin() {
  console.log("\n🔐 Tests de connexion admin");

  // Test connexion admin valide
  try {
    const { status, data } = await makeRequest('POST', '/auth/login/admin', {
      email: "admin@medical.fr",
      password: "admin123"
    });

    if (status === 200 && data.token) {
      logTest("Connexion Admin Valide", true, "Connexion admin réussie", { 
        user: data.user.fullName,
        role: data.user.role 
      });
      return data.token; // Retourner le token pour les tests suivants
    } else {
      logTest("Connexion Admin Valide", false, `Echec: ${data.error || 'Erreur inconnue'}`);
    }
  } catch (error) {
    logTest("Connexion Admin Valide", false, `Erreur: ${error}`);
  }

  return null;
}

async function testTokenVerification() {
  console.log("\n🔍 Tests de vérification de token");

  // Obtenir un token valide
  const { status: loginStatus, data: loginData } = await makeRequest('POST', '/auth/login/patient', {
    email: "patient@test.fr",
    password: "patient123"
  });

  if (loginStatus === 200 && loginData.token) {
    // Test vérification avec token valide
    try {
      const { status, data } = await makeRequest('GET', '/auth/verify', null, {
        'Authorization': `Bearer ${loginData.token}`
      });

      if (status === 200 && data.user) {
        logTest("Token Valide", true, "Vérification réussie", { 
          user: data.user.firstName + " " + data.user.lastName 
        });
      } else {
        logTest("Token Valide", false, "Devrait accepter un token valide");
      }
    } catch (error) {
      logTest("Token Valide", false, `Erreur: ${error}`);
    }

    // Test vérification avec token invalide
    try {
      const { status, data } = await makeRequest('GET', '/auth/verify', null, {
        'Authorization': 'Bearer token_invalide'
      });

      if (status === 401) {
        logTest("Token Invalide", true, "Rejet correct du token invalide");
      } else {
        logTest("Token Invalide", false, "Devrait rejeter un token invalide");
      }
    } catch (error) {
      logTest("Token Invalide", false, `Erreur: ${error}`);
    }

    // Test sans token
    try {
      const { status, data } = await makeRequest('GET', '/auth/verify');

      if (status === 401) {
        logTest("Aucun Token", true, "Rejet correct sans token");
      } else {
        logTest("Aucun Token", false, "Devrait rejeter sans token");
      }
    } catch (error) {
      logTest("Aucun Token", false, `Erreur: ${error}`);
    }
  }
}

async function testAuthFlow() {
  console.log("\n🔄 Test du flux complet d'authentification");

  try {
    // 1. Inscription d'un nouveau patient
    const { status: regStatus, data: regData } = await makeRequest('POST', '/auth/register/patient', {
      email: "flowtest@medical.fr",
      password: "FlowTest123",
      firstName: "Flow",
      lastName: "Test",
      phoneNumber: "06 99 88 77 66"
    });

    if (regStatus !== 201) {
      logTest("Flux Complet", false, "Echec de l'inscription");
      return;
    }

    // 2. Vérification du token d'inscription
    const { status: verifyStatus, data: verifyData } = await makeRequest('GET', '/auth/verify', null, {
      'Authorization': `Bearer ${regData.token}`
    });

    if (verifyStatus !== 200) {
      logTest("Flux Complet", false, "Token d'inscription invalide");
      return;
    }

    // 3. Connexion avec le nouveau compte
    const { status: loginStatus, data: loginData } = await makeRequest('POST', '/auth/login/patient', {
      email: "flowtest@medical.fr",
      password: "FlowTest123"
    });

    if (loginStatus !== 200) {
      logTest("Flux Complet", false, "Echec de la connexion");
      return;
    }

    // 4. Vérification du token de connexion
    const { status: verifyLoginStatus, data: verifyLoginData } = await makeRequest('GET', '/auth/verify', null, {
      'Authorization': `Bearer ${loginData.token}`
    });

    if (verifyLoginStatus === 200) {
      logTest("Flux Complet", true, "Inscription → Token → Connexion → Vérification ✓", {
        user: verifyLoginData.user.firstName + " " + verifyLoginData.user.lastName
      });
    } else {
      logTest("Flux Complet", false, "Token de connexion invalide");
    }

  } catch (error) {
    logTest("Flux Complet", false, `Erreur dans le flux: ${error}`);
  }
}

async function runAllTests() {
  console.log("🧪 Début des tests d'authentification\n");

  await testHealthCheck();
  await testPatientRegistration();
  await testPatientLogin();
  await testAdminRegistration();
  await testAdminLogin();
  await testTokenVerification();
  await testAuthFlow();

  // Résumé des résultats
  console.log("\n" + "=".repeat(50));
  console.log("📊 RÉSUMÉ DES TESTS");
  console.log("=".repeat(50));

  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;

  console.log(`\n📈 Total des tests: ${totalTests}`);
  console.log(`✅ Tests réussis: ${passedTests}`);
  console.log(`❌ Tests échoués: ${failedTests}`);
  console.log(`📊 Taux de réussite: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  if (failedTests > 0) {
    console.log("❌ TESTS ÉCHOUÉS:");
    results.filter(r => !r.success).forEach(test => {
      console.log(`  - ${test.name}: ${test.message}`);
    });
  }

  console.log("\n🎯 COMPTES DE TEST DISPONIBLES:");
  console.log("👤 Admin: admin@medical.fr / admin123");
  console.log("🧑‍🤝‍🧑 Patient: patient@test.fr / patient123");

  console.log("\n🌐 URL de l'application:");
  console.log(`Frontend: https://5000-i2ss87xx23jkazvf1xsd4-6532622b.e2b.dev`);
  console.log(`API: https://5000-i2ss87xx23jkazvf1xsd4-6532622b.e2b.dev/api`);
}

// Exécution
runAllTests().catch(console.error);