#!/usr/bin/env python3
"""
Generate a secure Django secret key
"""

from django.core.management.utils import get_random_secret_key

if __name__ == '__main__':
    secret_key = get_random_secret_key()
    print("Generated Django Secret Key:")
    print(secret_key)
    print("\nCopy this key and update your .env file:")
    print(f"SECRET_KEY={secret_key}")
