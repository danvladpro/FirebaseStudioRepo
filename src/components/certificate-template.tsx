
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import React from 'react';

// Note: @react-pdf/renderer does not support all CSS properties.
// Font registration is necessary for custom fonts. Default fonts are limited.
// Using Helvetica, which is a safe, built-in font.

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  border: {
    position: 'absolute',
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
    borderWidth: 2,
    borderColor: '#4A90E2', // A professional blue
  },
  content: {
    margin: 'auto',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 10,
  },
  name: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#4A90E2',
    borderBottomWidth: 2,
    borderBottomColor: '#F5A623', // An orange accent
    paddingBottom: 4,
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 12,
    color: '#333333',
    width: '80%',
    lineHeight: 1.5,
    marginBottom: 30,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureContainer: {
    alignItems: 'center',
  },
  signatureLine: {
    width: 150,
    height: 1,
    backgroundColor: '#333333',
    marginTop: 4,
    marginBottom: 4,
  },
  signatureTitle: {
    fontSize: 10,
    color: '#555555',
  },
   dateText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  dateContainer: {
     alignItems: 'center',
  },
   dateTitle: {
    fontSize: 10,
    color: '#555555',
  },
  seal: {
    width: 70,
    height: 70,
    position: 'absolute',
    right: 50,
    bottom: 50,
  },
  logo: {
      width: 40,
      height: 40,
      marginBottom: 10,
  }
});

interface CertificateTemplateProps {
  name: string;
  examName: string;
  date: string;
}

// Using React.createElement here is not necessary as the file is a .tsx file.
// The issue was likely in the structure passed to the renderer.
// This simplified and explicit structure should resolve it.
export const CertificateTemplate = ({ name, examName, date }: CertificateTemplateProps) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.border} fixed />
      
      <View style={styles.content}>
        <Image
          style={styles.logo}
          src="https://firebasestorage.googleapis.com/v0/b/ai-app-builder-001.appspot.com/o/public%2Ficon.png?alt=media"
        />
        <Text style={styles.headerText}>Certificate of Achievement</Text>
        <Text style={styles.subtitle}>This is to certify that</Text>
        
        <Text style={styles.name}>{name}</Text>
        
        <Text style={styles.bodyText}>
          has successfully completed and demonstrated proficiency in the {examName}.
          This certification recognizes their mastery of essential Excel shortcuts and workflows.
        </Text>
      </View>
      
      <View style={styles.footer} fixed>
        <View style={styles.signatureContainer}>
          <Text style={styles.signatureTitle}>The Excel Ninja Team</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureTitle}>Authorized Signature</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{date}</Text>
           <View style={styles.signatureLine} />
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
