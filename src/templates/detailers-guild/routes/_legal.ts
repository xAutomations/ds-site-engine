/**
 * Resolves a legal document for the Guild legal routes.
 *
 * Two sources, in priority order:
 *   1. client/content/legal/{id}.md — the payload's own text, for clients carrying
 *      industry-specific liability or warranty clauses.
 *   2. lib/legal.ts — the shared Detailer Systems boilerplate, generated from config.
 *      Reviewed once and reused unchanged, which is the point of it.
 *
 * siteConfig.legal.source records which of the two a client is on, so "has this text
 * been through legal review?" is answered by a declared field rather than by whether
 * a file happens to exist on disk.
 */
import { getEntry, getCollection } from 'astro:content';
import { siteConfig } from '../../../lib/site-config';
import { defaultLegalContact, privacyPolicy, termsOfService } from '../../../lib/legal';
import type { GuildLegalDoc } from '../types';

type LegalId = 'privacy-policy' | 'tos';

const TITLES: Record<LegalId, string> = {
  'privacy-policy': 'Privacy Policy',
  tos: 'Terms of Service',
};

export async function resolveLegalDoc(id: LegalId): Promise<GuildLegalDoc> {
  const title = TITLES[id];
  const authored = await getEntry('legal', id);

  if (authored) {
    return {
      title: authored.data.title,
      intro: authored.data.intro,
      emphasis: authored.data.emphasis,
      sections: authored.data.sections,
      contact: authored.data.contact ?? defaultLegalContact(siteConfig, title.toLowerCase()),
    };
  }

  const services = await getCollection('guildServices');
  const generated =
    id === 'tos'
      ? termsOfService(siteConfig, services.map((entry) => entry.data.name))
      : privacyPolicy(siteConfig);

  return {
    title,
    intro: generated.intro,
    emphasis: generated.emphasis,
    sections: generated.sections,
    contact: generated.contact,
  };
}

/** Meta description for a generated document — authored ones bring their own. */
export function legalMetaDescription(id: LegalId): string {
  const name = siteConfig.brand.name;
  return id === 'tos'
    ? `The terms governing use of the ${name} website and detailing services.`
    : `How ${name} collects, uses, and protects your personal information.`;
}
