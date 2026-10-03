import Header from './Header';
import Footer from './Footer';
import WhatsAppFloatingButton from './WhatsAppFloatingButton';
import ExploreMascotWidget from './ExploreMascotWidget';

export default function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <ExploreMascotWidget />
      <WhatsAppFloatingButton />
    </>
  );
}
