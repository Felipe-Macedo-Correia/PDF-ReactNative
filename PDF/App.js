import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const App = () => {
  const [dataContratante, setDataContratante] = useState(null);
  const [dataProfissional, setDataProfissional] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContratanteData = async () => {
    setLoading(true);
    setError(null); // Limpa erros anteriores
    try {
      const response = await axios.get('http://192.168.15.119:8000/api/cli/9d48f5c9-7cd9-4a81-9e69-b0081ad1082a');
      setDataContratante(response.data);
    } catch (err) {
      setError(err.message);
      Alert.alert('Erro ao buscar dados do contratante', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfissionalData = async () => {
    try {
      const response = await axios.get('http://192.168.15.119:8000/api/pro/9d48fc9d-8675-4501-ac2a-0230cf94ad33');
      setDataProfissional(response.data);
    } catch (err) {
      setError(err.message);
      Alert.alert('Erro ao buscar dados do profissional', err.message);
    }
  };

  const createPDF = async () => {
    if (!dataContratante || !dataProfissional) {
      Alert.alert('Erro', 'Nenhum dado disponível para gerar o PDF.');
      return;
    }

    // Extraindo os campos específicos
    const { nomeContratante, cpfContratante } = dataContratante;
    const { nomeContratado, cpfContratado } = dataProfissional;

    // HTML do contrato
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Contrato de Prestação de Serviços</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: blue; text-align: center; }
          h2 { color: darkblue; }
          p { font-size: 16px; line-height: 1.5; }
          .section { margin-bottom: 20px; }
          .signature { margin-top: 50px; }
        </style>
      </head>
      <body>
        <h1>Contrato de Prestação de Serviços</h1>
        
        <div class="section">
          <h2>Parte Contratante</h2>
          <p><strong>Contratante:</strong> ${nomeContratante}</p>
          <p><strong>CPF:</strong> ${cpfContratante}</p>
        </div>

        <div class="section">
          <h2>Parte Contratado</h2>
          <p><strong>Nome:</strong> ${nomeContratado}</p>
          <p><strong>CPF:</strong> ${cpfContratado}</p>
        </div>

        <div class="section">
          <h2>Objeto do Contrato</h2>
          <p>O presente contrato tem como objeto a prestação de serviços de acordo entre as partes.</p>
        </div>

        <div class="section">
          <h2>Cláusulas</h2>
          <p>1. O Contratado se compromete a prestar os serviços especificados neste contrato.</p>
          <p>2. O Contratante pagará ao Contratado o valor acordado pelas partes.</p>
          <p>3. As partes concordam que este contrato poderá ser rescindido em caso de descumprimento de suas cláusulas.</p>
        </div>

        <div class="signature">
          <p>_______________________________</p>
          <p>Assinatura do Contratante</p>

          <p>_______________________________</p>
          <p>Assinatura do Contratado</p>
        </div>
      </body>
      </html>
    `;

    // Gera o PDF
    const { uri } = await Print.printToFileAsync({ html });

    // Compartilha o PDF gerado
    Sharing.shareAsync(uri).then(() => {
      Alert.alert('PDF compartilhado!', uri);
    });
  };

  useEffect(() => {
    fetchContratanteData();
    fetchProfissionalData();
  }, []);

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.error}>{error}</Text>}
      {dataContratante && dataProfissional && (
        <View>
          <Text style={styles.title}>Dados Recebidos do Contratante</Text>
          <Text style={styles.data}>Nome: {dataContratante.nomeContratante}</Text>
          <Text style={styles.data}>CPF: {dataContratante.cpfContratante}</Text>

          <Text style={styles.title}>Dados Recebidos do Profissional:</Text>
          <Text style={styles.data}>Nome: {dataProfissional.nomeContratado}</Text>
          <Text style={styles.data}>CPF: {dataProfissional.cpfContratado}</Text>

          <Button title="Gerar PDF" onPress={createPDF} color="#4CAF50" />
        </View>
      )}
      <Button title="Recarregar Dados" onPress={() => { fetchContratanteData(); fetchProfissionalData(); }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  data: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
  },
  error: {
    color: 'red',
  },
});

export default App;
