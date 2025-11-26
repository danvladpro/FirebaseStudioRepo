import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#F0F4F8',
    padding: 40,
    fontFamily: 'Helvetica',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },

  border: {
    position: 'absolute',
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
    borderWidth: 2,
    borderColor: '#3F51B5'
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30
  },

  logo: {
    width: 50,
    height: 50,
    marginRight: 10
  },

  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#3F51B5',
    fontFamily: 'Helvetica-Bold'
  },

  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20
  },

  presentedTo: {
    fontSize: 12,
    color: '#555',
    marginBottom: 10
  },

  name: {
    fontSize: 36,
    fontWeight: 700,
    fontFamily: 'Helvetica-Bold',
    color: '#3F51B5',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FFAB40',
    paddingBottom: 5
  },

  body: {
    fontSize: 14,
    color: '#333',
    width: 420,
    marginBottom: 30
  },

  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },

  signatureContainer: {
    alignItems: 'center'
  },

  signature: {
    fontFamily: 'Times-Italic',
    fontSize: 24,
    color: '#333'
  },

  signatureLine: {
    width: 150,
    height: 1,
    backgroundColor: '#333',
    marginTop: 4,
    marginBottom: 5
  },

  signatureTitle: {
    fontSize: 10,
    color: '#555'
  },

  dateContainer: {
    alignItems: 'center'
  },

  date: {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: 'Helvetica-Bold',
    color: '#333'
  },

  dateLine: {
    width: 120,
    height: 1,
    backgroundColor: '#333',
    marginBottom: 5
  },

  dateTitle: {
    fontSize: 10,
    color: '#555'
  },

  seal: {
    width: 80,
    height: 80,
    position: 'absolute',
    right: 30,
    bottom: 20
  }
});

interface CertificateTemplateProps {
  name: string;
  examName: string;
  date: string;
}

export const CertificateTemplate = ({
  name,
  examName,
  date
}: CertificateTemplateProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.border} fixed />

      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            style={styles.logo}
            src="https://firebasestorage.googleapis.com/v0/b/ai-app-builder-001.appspot.com/o/public%2Ficon.png?alt=media"
          />
          <Text style={styles.title}>Excel Ninja</Text>
        </View>

        <Text style={styles.subtitle}>Certificate of Achievement</Text>
        <Text style={styles.presentedTo}>Presented To</Text>

        <Text style={styles.name}>{name}</Text>

        <Text style={styles.body}>
          has successfully completed and demonstrated proficiency in the {examName}.
          This certification recognizes their mastery of essential Excel shortcuts and workflows.
        </Text>

      </View>

      <View style={styles.footer} fixed>
        <View style={styles.signatureContainer}>
          <Text style={styles.signature}>The Excel Ninja Team</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureTitle}>Authorized Signature</Text>
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.date}>{date}</Text>
          <View style={styles.dateLine} />
          <Text style={styles.dateTitle}>Date of Completion</Text>
        </View>
      </View>

      <Image
        style={styles.seal}
        src="https://firebasestorage.googleapis.com/v0/b/ai-app-builder-001.appspot.com/o/public%2Fseal.png?alt=media"
        fixed
      />
    </Page>
  </Document>
);
