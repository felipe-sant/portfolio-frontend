const TRANSLATION_EXCEPTIONS: Record<string, string[]> = {
    "location.city": ["São José dos Campos"],
    "location.region": ["SP"],
    "location.detail": ["Híbrido"],
    "items[].title": [
        "Maps",
        "MNIST Classifier",
        "Player Profile Clustering",
        "Conversor de Unidades",
        "Informática"
    ],
    "items[].organization": [
        "InCicle",
        "Poliedro Educação",
        "Fatec – Faculdade de Tecnologia do Estado de São Paulo (Jacareí)",
        "Etec – Escola Técnica Estadual Professora Ilza Nascimento Pintus (São José dos Campos)",
        "Expro",
        "Microcamp São José dos Campos"
    ],
    "items[].details[]": ["200 horas"],
    "items[].disciplines[]": ["Ética"],
    "items[].certificates[].issuer": ["Expro", "Microcamp"],
    "items[].role": ["Full stack", "Frontend", "Full stack + IA"],
    "items[].duration": ["13 meses", "2 semanas", "1 semana"]
}

export default TRANSLATION_EXCEPTIONS
