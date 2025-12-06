#!/usr/bin/env python3
"""
Script pour échanger un code d'autorisation OAuth2 Google contre un refresh token
"""

import requests
import json
import sys
import os
from urllib.parse import parse_qs, urlparse

def exchange_code_for_token(auth_code, client_id, client_secret, redirect_uri):
    """
    Échange le code d'autorisation contre un access token et refresh token
    """
    url = "https://oauth2.googleapis.com/token"
    
    data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'code': auth_code,
        'grant_type': 'authorization_code',
        'redirect_uri': redirect_uri
    }
    
    try:
        response = requests.post(url, data=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de l'échange de token: {e}")
        return None

def main():
    # Configuration OAuth2
    CLIENT_ID = "603850749287-208mpcdm3pb7qk09rndqapig5cq6ra14.apps.googleusercontent.com"
    CLIENT_SECRET = "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"
    REDIRECT_URI = "https://planning-7qkb7uw7v-ikips-projects.vercel.app/api/oauth/callback"
    
    print("🔄 Échange de code OAuth2 contre refresh token")
    print("=" * 60)
    
    # Récupérer le code d'autorisation
    if len(sys.argv) > 1:
        auth_code = sys.argv[1]
        print(f"📋 Code d'autorisation reçu: {auth_code[:20]}...")
    else:
        auth_code = input("📋 Entrez votre code d'autorisation OAuth2: ").strip()
    
    if not auth_code:
        print("❌ Aucun code d'autorisation fourni")
        return
    
    print(f"🔗 Redirect URI: {REDIRECT_URI}")
    print()
    
    # Échanger le code contre le token
    print("⏳ Échange en cours...")
    token_data = exchange_code_for_token(auth_code, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
    
    if token_data:
        print("✅ Succès ! Token obtenu:")
        print()
        
        # Afficher les informations importantes
        if 'refresh_token' in token_data:
            refresh_token = token_data['refresh_token']
            print(f"🔑 REFRESH TOKEN (à copier dans Vercel):")
            print(f"   {refresh_token}")
            print()
            
            # Sauvegarder dans un fichier
            with open('/workspace/planning/refresh_token.txt', 'w') as f:
                f.write(refresh_token)
            print("💾 Refresh token sauvegardé dans: refresh_token.txt")
            print()
        
        if 'access_token' in token_data:
            print(f"🎫 ACCESS TOKEN (temporaire, expire dans 3600s):")
            print(f"   {token_data['access_token'][:20]}...")
            print()
        
        if 'expires_in' in token_data:
            print(f"⏰ Expiration access token: {token_data['expires_in']} secondes")
            print()
        
        # Instructions pour Vercel
        print("🚀 PROCHAINES ÉTAPES:")
        print("1. Copiez le REFRESH TOKEN ci-dessus")
        print("2. Allez dans votre dashboard Vercel")
        print("3. Sélectionnez votre projet 'planning'")
        print("4. Allez dans Settings > Environment Variables")
        print("5. Ajoutez une nouvelle variable:")
        print("   Nom: GOOGLE_REFRESH_TOKEN")
        print("   Valeur: [COLLER LE REFRESH TOKEN]")
        print("6. Redéployez l'application")
        print()
        
        return True
    else:
        print("❌ Échec de l'échange de token")
        return False

if __name__ == "__main__":
    main()