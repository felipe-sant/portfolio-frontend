const TRANSLATION_EXCEPTIONS: Record<string, string[]> = {
    "location.city": ["São José dos Campos"],
    "location.region": ["SP"],
    "items[].organization": [
        "InCicle",
        "Poliedro Educação",
        "Fatec – Faculdade de Tecnologia do Estado de São Paulo (Jacareí)",
        "Etec – Escola Técnica Estadual Professora Ilza Nascimento Pintus (São José dos Campos)",
        "Expro",
        "Microcamp São José dos Campos"
    ],
    "items[].certificates[].issuer": ["Expro", "Microcamp"],
    "items[].title": ["Maps", "MNIST Classifier", "Player Profile Clustering"]
}

export default TRANSLATION_EXCEPTIONS
