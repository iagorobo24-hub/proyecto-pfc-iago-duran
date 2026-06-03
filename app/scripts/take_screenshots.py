"""
Script para generar capturas de pantalla de todos los módulos de la app
Usa Playwright para automatizar el navegador
"""

import asyncio
from playwright.async_api import async_playwright
import os
from datetime import datetime

# Configuración
OUTPUT_DIR = "/home/abu/github_repos/proyecto-pfc-iago-duran/proyecto-fin-ciclo/MEJORA_NOCTURNA/capturas"
BASE_URL = os.environ.get("APP_URL", "http://localhost:5173")  # Por defecto localhost

# Rutas de cada módulo (ajustar según el routing real de la app)
MODULES = [
    {"id": "01-landing", "name": "01-Landing-Page", "path": "/", "description": "Página de landing pública"},
    {"id": "02-login", "name": "02-Login", "path": "/login", "description": "Página de autenticación"},
    {"id": "03-dashboard", "name": "03-Dashboard", "path": "/dashboard", "description": "Dashboard principal con módulos"},
    {"id": "04-fichas-tecnicas", "name": "04-Fichas-Tecnicas", "path": "/fichas", "description": "Catálogo de productos"},
    {"id": "05-ficha-detalle", "name": "05-Ficha-Detalle", "path": "/fichas/1", "description": "Detalle de producto"},
    {"id": "06-simulador", "name": "06-Simulador-Almacen", "path": "/simulador", "description": "Simulador de almacén"},
    {"id": "07-incidencias", "name": "07-Incidencias", "path": "/incidencias", "description": "Dashboard de incidencias"},
    {"id": "08-kpis", "name": "08-KPIs", "path": "/kpis", "description": "Dashboard de KPIs logísticos"},
    {"id": "09-presupuestos", "name": "09-Presupuestos", "path": "/presupuestos", "description": "Generador de presupuestos"},
    {"id": "10-formacion", "name": "10-Formacion", "path": "/formacion", "description": "Matriz de formación"},
    {"id": "11-sonex", "name": "11-SONEX-Chat", "path": "/sonex", "description": "Asistente técnico SONEX"},
]

async def take_screenshot(page, module, output_dir):
    """Toma captura de un módulo"""
    url = f"{BASE_URL}{module['path']}"
    print(f"\n📸 Capturando: {module['name']} - {url}")
    
    try:
        # Navegar
        await page.goto(url, wait_until="networkidle", timeout=30000)
        
        # Esperar un poco para que carguen animaciones
        await page.wait_for_timeout(2000)
        
        # Configurar viewport
        await page.set_viewport_size({"width": 1920, "height": 1080})
        
        # Ruta de salida
        output_path = os.path.join(output_dir, f"{module['name']}.png")
        
        # Tomar captura
        await page.screenshot(path=output_path, full_page=False)
        
        print(f"  ✅ Guardado: {output_path}")
        return output_path
        
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        return None

async def main():
    print("=" * 80)
    print("GENERANDO CAPTURAS DE PANTALLA - PROYECTO PFC")
    print("=" * 80)
    print(f"URL Base: {BASE_URL}")
    print(f"Output: {OUTPUT_DIR}")
    print(f"Módulos: {len(MODULES)}")
    
    # Crear directorio
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Guardar metadata
    metadata = {
        "timestamp": datetime.now().isoformat(),
        "base_url": BASE_URL,
        "modules": MODULES,
        "output_dir": OUTPUT_DIR
    }
    
    import json
    with open(os.path.join(OUTPUT_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    success_count = 0
    
    async with async_playwright() as p:
        # Lanzar navegador
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=1
        )
        page = await context.new_page()
        
        # Tomar capturas
        for module in MODULES:
            result = await take_screenshot(page, module, OUTPUT_DIR)
            if result:
                success_count += 1
        
        await browser.close()
    
    print("\n" + "=" * 80)
    print(f"COMPLETADO: {success_count}/{len(MODULES)} capturas exitosas")
    print("=" * 80)
    
    # Guardar log
    with open(os.path.join(OUTPUT_DIR, "log.md"), "w") as f:
        f.write(f"# Log de Capturas\n\n")
        f.write(f"**Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"**URL:** {BASE_URL}\n")
        f.write(f"**Exitosas:** {success_count}/{len(MODULES)}\n\n")
        f.write("## Módulos capturados:\n\n")
        for module in MODULES:
            status = "✅" if success_count > 0 else "⚠️"
            f.write(f"- {status} **{module['name']}**: {module['description']}\n")

if __name__ == "__main__":
    asyncio.run(main())