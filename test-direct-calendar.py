#!/usr/bin/env python3
"""
Test direct du service Google Calendar sans TRPC
"""

import requests
import json

def test_direct_calendar():
    """Test direct du service Google Calendar"""
    
    base_url = "https://planning-7qkb7uw7v-ikips-projects.vercel.app"
    
    print("🔍 TEST DIRECT GOOGLE CALENDAR")
    print("=" * 40)
    
    # Test des différents chemins d'API possibles
    possible_paths = [
        "/api/index.js",
        "/api/index.ts", 
        "/api/",
        "/",
        "/api/trpc",
        "/api/trpc/"
    ]
    
    for path in possible_paths:
        print(f"\n🧪 Test chemin: {path}")
        try:
            response = requests.get(f"{base_url}{path}", timeout=5)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                print(f"   ✅ Accessible")
                print(f"   Content preview: {response.text[:100]}...")
            elif response.status_code == 404:
                print(f"   ❌ Not found")
            else:
                print(f"   ⚠️  Other: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Erreur: {e}")
    
    # Test avec un payload TRPC simple
    print(f"\n🧪 Test TRPC avec payload simple:")
    try:
        trpc_payload = {
            "0": {
                "json": {
                    "id": "booking.getAvailableSlots",
                    "method": "query",
                    "params": {
                        "input": {"date": "2025-12-08"}
                    }
                }
            }
        }
        
        response = requests.post(
            f"{base_url}/api/trpc",
            json=trpc_payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        
    except Exception as e:
        print(f"   ❌ Erreur TRPC: {e}")
    
    # Test health avec plus de détails
    print(f"\n🧪 Test Health détaillé:")
    try:
        response = requests.get(f"{base_url}/api/health", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response complète:")
            print(json.dumps(data, indent=2))
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   ❌ Erreur: {e}")

if __name__ == "__main__":
    test_direct_calendar()