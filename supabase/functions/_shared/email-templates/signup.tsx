/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

// Mêmes couleurs et même logo que le gabarit HTML partagé des emails
// transactionnels (emails.ts). Logo en image via URL publique : pas de
// base64 ni de pièce jointe, pour éviter les blocages Gmail.
const NAVY = '#070E42'
const CREAM = '#F5F1E8'
const GOLD = '#D9BB87'
const LOGO_URL = 'https://findr-connection-finder.lovable.app/logo-email.png'

export const SignupEmail = ({
  siteName,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Confirme ton adresse email pour {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section className="dm-header" style={header}>
          <Img
            src={LOGO_URL}
            alt="findr"
            width="132"
            style={logo}
          />
        </Section>
        <Section style={content}>
          <Heading style={h1}>Bienvenue sur {siteName} !</Heading>
          <Text style={text}>
            Encore une étape avant de pouvoir chercher ou proposer tes premiers
            objets : confirme ton adresse email en cliquant sur le bouton
            ci-dessous.
          </Text>
          <Button className="dm-btn" style={button} href={confirmationUrl}>
            Confirmer mon adresse email
          </Button>
          <Text style={hint}>
            Si tu n'es pas à l'origine de cette inscription, tu peux ignorer ce
            message.
          </Text>
        </Section>
      </Container>
      <Section style={footerSection}>
        <Text style={footer}>FINDR APP SAS</Text>
      </Section>
    </Body>
  </Html>
)

export default SignupEmail

const main = {
  backgroundColor: CREAM,
  fontFamily: 'Arial, Helvetica, sans-serif',
  margin: 0,
  padding: '28px 12px',
}
const container = {
  maxWidth: '520px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  overflow: 'hidden' as const,
  border: '1px solid #ECE7DE',
}
const header = {
  backgroundColor: NAVY,
  padding: '26px 24px',
  textAlign: 'center' as const,
}
const logo = {
  display: 'block',
  margin: '0 auto',
  border: 0,
  width: '132px',
  height: 'auto',
}
const content = {
  padding: '30px 28px 26px 28px',
  backgroundColor: '#ffffff',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'normal' as const,
  color: NAVY,
  margin: '0 0 16px',
  fontFamily: 'Georgia, Times New Roman, serif',
}
const text = {
  fontSize: '14px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '0 0 24px',
}
const button = {
  backgroundColor: GOLD,
  color: NAVY,
  fontSize: '15px',
  fontWeight: 'bold' as const,
  border: 'none',
  borderRadius: '999px',
  padding: '14px 30px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hint = {
  fontSize: '12px',
  color: '#9CA3AF',
  lineHeight: '1.5',
  margin: '26px 0 0',
}
const footerSection = {
  maxWidth: '520px',
  margin: '18px auto 0',
  backgroundColor: '#F1EFEA',
  borderRadius: '10px',
  padding: '14px 24px',
  textAlign: 'center' as const,
}
const footer = {
  fontSize: '11px',
  color: '#9CA3AF',
  margin: 0,
  letterSpacing: '0.6px',
}
// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { background-color: #D9BB87 !important; color: #070E42 !important; }
    .dm-header { background-color: #070E42 !important; }
  }
  [data-ogsc] .dm-btn { background-color: #D9BB87 !important; color: #070E42 !important; }
  [data-ogsb] .dm-btn { background-color: #D9BB87 !important; color: #070E42 !important; }
  [data-ogsc] .dm-header { background-color: #070E42 !important; }
`
