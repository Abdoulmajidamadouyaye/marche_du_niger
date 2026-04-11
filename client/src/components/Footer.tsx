import Link from "next/link";
import Image from "next/image";
import SocialLinks from "./SocialLinks";

const Footer = () => {
  return (
    <footer className="mt-16 rounded-lg bg-gray-900 px-8 py-10 text-gray-300">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-[1.2fr_0.8fr_1fr]">

        <div className="flex flex-col gap-4 items-center md:items-start">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="MARCHÉ DU NIGER "
              width={38}
              height={38}
            />
            <p className="hidden md:block text-md font-medium tracking-wider text-white">
             MARCHÉ DU NIGER 
            </p>
          </Link>

          <p className="text-sm">© 2025 MARCHÉ DU NIGER </p>
          <p className="text-sm">Tous droits réservés.</p>
          <p className="max-w-sm text-sm leading-6 text-gray-400 text-center md:text-left">
            Votre plateforme e-commerce pour les voitures, motos, telephones, habillements et plus encore au Niger.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">Acces rapide</p>
          <Link href="/" className="transition hover:text-white">Accueil</Link>
          <Link href="/#checkout" className="transition hover:text-white">Panier et paiement</Link>
          <Link href="/login" className="transition hover:text-white">Connexion client</Link>
        </div>

        <div className="flex flex-col gap-4 items-center md:items-start">
          <SocialLinks
            className="w-full text-center md:text-left"
            iconClassName="h-5 w-5"
            showLabels
            title="Réseaux sociaux"
            variant="dark"
          />
          <p className="text-sm leading-6 text-gray-400 text-center md:text-left">
            Retrouvez MARCHÉ DU NIGER sur TikTok, LinkedIn, Facebook et Twitter pour suivre les nouveautes et promotions.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
