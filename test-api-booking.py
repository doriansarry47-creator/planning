#!/usr/bin/env python3
"""
Script de test pour diagnostiquer l'API de réservation
"""

import requests
import json

def test_api_endpoints():
    """Teste tous les endpoints de l'API"""
    
    base_url = "https://planning-7qkb7uw7v-ikips-projects.vercel.app"
    
    print("🔍 DIAGNOSTIC API DE RÉSERVATION")
    print("=" * 50)
    
    # Test health check
    print("\n1️⃣ Test Health Check:")
    try:
        response = requests.get(f"{base_url}/api/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Status: {data.get('status')}")
            print(f"   ✅ Google Calendar: {data.get('googleCalendar')}")
            print(f"   ✅ Service: {data.get('service')}")
        else:
            print(f"   ❌ Erreur: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erreur connexion: {e}")
    
    # Test TRPC endpoint
    print("\n2️⃣ Test TRPC Endpoint:")
    try:
        payload = {
            "input": {"date": "2025-12-08"}
        }
        response = requests.post(
            f"{base_url}/api/trpc/booking.getAvailableSlots",
            json={"input": payload},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
    
    # Test avec différents noms d'endpoints
    print("\n3️⃣ Test Endpoints Alternatifs:")
    endpoints = [
        "booking.getAvailabilitiesByDate",
        "patientBooking.getAvailableSlots", 
        "patientBooking.getAvailableSlots",
        "booking.getAvailableSlots"
    ]
    
    for endpoint in endpoints:
        try:
            payload = {"input": {"date": "2025-12-08"}}
            response = requests.post(
                f"{base_url}/api/trpc/{endpoint}",
                json={"input": payload},
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            status = "✅" if response.status_code == 200 else f"❌ ({response.status_code})"
            print(f"   {endpoint}: {status}")
        except Exception as e:
            print(f"   {endpoint}: ❌ Erreur")
    
    # Test OAuth
    print("\n4️⃣ Test OAuth Init:")
    try:
        response = requests.get(f"{base_url}/api/oauth/init", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ URL OAuth générée")
        else:
            print(f"   ❌ Erreur OAuth: {response.text[:100]}")
    except Exception as e:
        print(f"   ❌ Erreur connexion OAuth: {e}")

if __name__ == "__main__":
    test_api_endpoints()