export default function cleanLinkedInUrl(input: string): string {
    const u = new URL(input);
    // garder le host tel quel (peut être fr.linkedin.com ou www.linkedin.com)
    // ne rien casser si ce n’est pas un profil
    if (!/^\/in\//.test(u.pathname)) {
        // pour les pages entreprise: /company/, écoles: /school/, etc. -> juste enlever les params
        u.search = '';
        u.hash = '';
        return u.toString();
    }

    // Profil: /in/<handle>[...]
    // On garde uniquement /in/<handle>/
    const parts = u.pathname.split('/').filter(Boolean); // ["in", "glenn-grente", ...]
    const handle = parts[1] ?? '';
    u.pathname = `/in/${handle}/`; // forcer le trailing slash
    u.search = ''; // enlever ?...
    u.hash = ''; // enlever #...
    return u.toString();
}
