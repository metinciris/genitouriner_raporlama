import React, { useState, useEffect } from 'react';
import { Copy, Info, Check } from 'lucide-react';

const PathologyReportSystem = () => {
  const [formData, setFormData] = useState({
    // Hasta Bilgileri
    patientName: '',
    patientId: '',
    dateOfBirth: '',
    dateOfRequest: '',
    accessionNumber: '',
    
    // Klinik Bilgiler
    clinicalHistory: '',
    previousTherapy: [],
    otherClinicalInfo: '',
    
    // Ameliyat Bilgileri
    operativeProcedure: '',
    additionalSpecimens: '',
    additionalSpecimensDetails: '',
    
    // Makroskopik Bulgular
    tumourFocality: '',
    maxTumourDimension: '',
    additionalDimensions: '',
    macroscopicSite: [],
    macroscopicInvasion: [],
    
    // Mikroskopik Bulgular
    histologicalType: '',
    histologicalSubtype: '',
    histologicalSubtypePercentage: '',
    histologicalGrade: '',
    microscopicInvasion: [],
    nonInvasiveCarcinoma: [],
    nonInvasiveExtent: '',
    associatedLesions: '',
    associatedLesionsDetails: '',
    lymphovascularInvasion: '',
    
    // Cerrahi Sınırlar
    marginStatus: '',
    marginDetails: [],
    
    // Lenf Nodları
    lymphNodeStatus: '',
    lymphNodesExamined: '',
    positiveLymphNodes: '',
    extranodal: '',
    largestMetastasis: '',
    lymphNodeLocation: '',
    
    // Eşlik Eden Patoloji
    coexistentPathology: '',
    nonNeoplasticRenal: '',
    
    // Yardımcı Çalışmalar
    ancillaryStudies: '',
    ancillaryStudiesDetails: '',
    
    // Uzak Metastaz
    distantMetastases: '',
    distantMetastasesDetails: '',
    
    // TNM Descriptors
    tnmDescriptors: [],
    
    // Blok Tanımlama
    blockIdentification: ''
  });

  const [showToast, setShowToast] = useState(false);
  const [activePopup, setActivePopup] = useState(null);

  // Patolojik evreleme hesaplama
  const calculateStaging = () => {
    let pT = 'TX', pN = 'NX';
    
    // pT hesaplama
    if (formData.microscopicInvasion.includes('no_evidence')) {
      pT = 'T0';
    } else if (formData.microscopicInvasion.includes('papillary_non_invasive')) {
      pT = 'Ta';
    } else if (formData.microscopicInvasion.includes('carcinoma_in_situ')) {
      pT = 'Tis';
    } else if (formData.microscopicInvasion.includes('lamina_propria')) {
      pT = 'T1';
    } else if (formData.microscopicInvasion.includes('muscularis_propria')) {
      pT = 'T2';
    } else if (formData.microscopicInvasion.includes('peripelvic_fat') || 
               formData.microscopicInvasion.includes('renal_stroma')) {
      pT = 'T3';
    } else if (formData.microscopicInvasion.includes('perinephric_fat') || 
               formData.microscopicInvasion.includes('adjacent_structures')) {
      pT = 'T4';
    }
    
    // pN hesaplama
    if (formData.lymphNodeStatus === 'not_submitted') {
      pN = 'NX';
    } else if (formData.lymphNodeStatus === 'not_involved') {
      pN = 'N0';
    } else if (formData.lymphNodeStatus === 'involved') {
      if (formData.positiveLymphNodes === '1' && parseInt(formData.largestMetastasis) <= 20) {
        pN = 'N1';
      } else {
        pN = 'N2';
      }
    }
    
    // TNM Descriptors ekleme
    let descriptors = '';
    if (formData.tnmDescriptors.length > 0) {
      descriptors = formData.tnmDescriptors.join('');
    }
    
    return `${descriptors}${pT}${pN}`;
  };

  const generateReport = () => {
    const staging = calculateStaging();
    const reportParts = [];
    
    // Başlık
    reportParts.push('BÖBREK PELVİSİ VE ÜRETER KARSİNOMU PATOLOJİ RAPORU');
    reportParts.push('');
    
    // Hasta Bilgileri
    const patientInfo = [];
    if (formData.patientName) patientInfo.push(`Hasta Adı: ${formData.patientName}`);
    if (formData.patientId) patientInfo.push(`Hasta No: ${formData.patientId}`);
    if (formData.dateOfBirth) patientInfo.push(`Doğum Tarihi: ${formData.dateOfBirth}`);
    if (formData.dateOfRequest) patientInfo.push(`Talep Tarihi: ${formData.dateOfRequest}`);
    if (formData.accessionNumber) patientInfo.push(`Laboratuvar No: ${formData.accessionNumber}`);
    
    if (patientInfo.length > 0) {
      reportParts.push('HASTA BİLGİLERİ:');
      reportParts.push(...patientInfo);
      reportParts.push('');
    }
    
    // Klinik Bilgiler
    const clinicalInfo = [];
    if (formData.clinicalHistory) clinicalInfo.push(`Klinik Geçmiş: ${formData.clinicalHistory}`);
    if (formData.previousTherapy.length > 0) {
      clinicalInfo.push(`Önceki Tedaviler: ${formData.previousTherapy.map(therapy => getPreviousTherapyText(therapy)).join(', ')}`);
    }
    if (formData.otherClinicalInfo) clinicalInfo.push(`Diğer Klinik Bilgiler: ${formData.otherClinicalInfo}`);
    
    if (clinicalInfo.length > 0) {
      reportParts.push('KLİNİK BİLGİLER:');
      reportParts.push(...clinicalInfo);
      reportParts.push('');
    }
    
    // Ameliyat Yöntemi
    if (formData.operativeProcedure) {
      reportParts.push('AMELİYAT YÖNTEMİ:');
      reportParts.push(getOperativeProcedureText(formData.operativeProcedure));
      reportParts.push('');
    }
    
    // Ek Örnekler
    if (formData.additionalSpecimens === 'submitted' && formData.additionalSpecimensDetails) {
      reportParts.push('EK ÖRNEKLER:');
      reportParts.push(formData.additionalSpecimensDetails);
      reportParts.push('');
    }
    
    // Makroskopik Bulgular
    const macroscopicFindings = [];
    if (formData.tumourFocality) macroscopicFindings.push(`Tümör Odak Sayısı: ${getTumourFocalityText(formData.tumourFocality)}`);
    if (formData.maxTumourDimension) {
      let sizeText = `Maksimum Tümör Boyutu: ${formData.maxTumourDimension} mm`;
      if (formData.additionalDimensions) sizeText += ` (${formData.additionalDimensions})`;
      macroscopicFindings.push(sizeText);
    }
    if (formData.macroscopicSite.length > 0) {
      macroscopicFindings.push(`Tümör Yerleşimi: ${formData.macroscopicSite.map(site => getMacroscopicSiteText(site)).join(', ')}`);
    }
    if (formData.macroscopicInvasion.length > 0) {
      macroscopicFindings.push(`Makroskopik İnvazyon: ${formData.macroscopicInvasion.map(inv => getMacroscopicInvasionText(inv)).join(', ')}`);
    }
    
    if (macroscopicFindings.length > 0) {
      reportParts.push('MAKROSKOPİK BULGULAR:');
      reportParts.push(...macroscopicFindings);
      reportParts.push('');
    }
    
    // Mikroskopik Bulgular
    const microscopicFindings = [];
    if (formData.histologicalType) {
      let typeText = `Histolojik Tip: ${getHistologicalTypeText(formData.histologicalType)}`;
      if (formData.histologicalSubtype) {
        typeText += ` (${formData.histologicalSubtype}`;
        if (formData.histologicalSubtypePercentage) {
          typeText += ` - %${formData.histologicalSubtypePercentage}`;
        }
        typeText += ')';
      }
      microscopicFindings.push(typeText);
    }
    if (formData.histologicalGrade) microscopicFindings.push(`Histolojik Derece: ${getHistologicalGradeText(formData.histologicalGrade)}`);
    if (formData.microscopicInvasion.length > 0) {
      microscopicFindings.push(`Mikroskopik İnvazyon Yaygınlığı: ${formData.microscopicInvasion.map(inv => getMicroscopicInvasionText(inv)).join(', ')}`);
    }
    if (formData.nonInvasiveCarcinoma.length > 0) {
      let nicText = `Non-invaziv Karsinom: ${formData.nonInvasiveCarcinoma.map(nic => getNonInvasiveCarcinomaText(nic)).join(', ')}`;
      if (formData.nonInvasiveExtent) nicText += ` (${formData.nonInvasiveExtent})`;
      microscopicFindings.push(nicText);
    }
    if (formData.associatedLesions) {
      let lesionsText = `Eşlik Eden Epitelyal Lezyonlar: ${formData.associatedLesions}`;
      if (formData.associatedLesionsDetails) lesionsText += ` - ${formData.associatedLesionsDetails}`;
      microscopicFindings.push(lesionsText);
    }
    if (formData.lymphovascularInvasion) {
      microscopicFindings.push(`Lenfovasküler İnvazyon: ${getLymphovascularInvasionText(formData.lymphovascularInvasion)}`);
    }
    
    if (microscopicFindings.length > 0) {
      reportParts.push('MİKROSKOPİK BULGULAR:');
      reportParts.push(...microscopicFindings);
      reportParts.push('');
    }
    
    // Cerrahi Sınırlar
    if (formData.marginStatus) {
      reportParts.push('CERRAHİ SINIRLARIN DURUMU:');
      let marginText = `Sınır Durumu: ${getMarginStatusText(formData.marginStatus)}`;
      if (formData.marginDetails.length > 0) {
        marginText += ` (${formData.marginDetails.map(detail => getMarginDetailText(detail)).join(', ')})`;
      }
      reportParts.push(marginText);
      reportParts.push('');
    }
    
    // Lenf Nodu Durumu
    if (formData.lymphNodeStatus) {
      const lymphNodeInfo = [];
      lymphNodeInfo.push(`Lenf Nodu Durumu: ${getLymphNodeStatusText(formData.lymphNodeStatus)}`);
      if (formData.lymphNodesExamined) lymphNodeInfo.push(`İncelenen Lenf Nodu Sayısı: ${formData.lymphNodesExamined}`);
      if (formData.positiveLymphNodes) lymphNodeInfo.push(`Pozitif Lenf Nodu Sayısı: ${formData.positiveLymphNodes}`);
      if (formData.largestMetastasis) lymphNodeInfo.push(`En Büyük Metastaz Boyutu: ${formData.largestMetastasis} mm`);
      if (formData.extranodal) lymphNodeInfo.push(`Ekstranodal Yayılım: ${getExtranodal(formData.extranodal)}`);
      if (formData.lymphNodeLocation) lymphNodeInfo.push(`Tutulu Lenf Nodu Lokalizasyonu: ${formData.lymphNodeLocation}`);
      
      reportParts.push('BÖLGESEL LENF NODU DURUMU:');
      reportParts.push(...lymphNodeInfo);
      reportParts.push('');
    }
    
    // Eşlik Eden Patoloji
    const coexistentInfo = [];
    if (formData.coexistentPathology) coexistentInfo.push(`Eşlik Eden Patoloji: ${formData.coexistentPathology}`);
    if (formData.nonNeoplasticRenal) coexistentInfo.push(`Non-neoplastik Böbrek Dokusu: ${formData.nonNeoplasticRenal}`);
    
    if (coexistentInfo.length > 0) {
      reportParts.push('EŞLİK EDEN PATOLOJİ:');
      reportParts.push(...coexistentInfo);
      reportParts.push('');
    }
    
    // Yardımcı Çalışmalar
    if (formData.ancillaryStudies === 'performed' && formData.ancillaryStudiesDetails) {
      reportParts.push('YARDIMCI ÇALIŞMALAR:');
      reportParts.push(formData.ancillaryStudiesDetails);
      reportParts.push('');
    }
    
    // Uzak Metastaz
    if (formData.distantMetastases === 'present' && formData.distantMetastasesDetails) {
      reportParts.push('UZAK METASTAZ:');
      reportParts.push(formData.distantMetastasesDetails);
      reportParts.push('');
    }
    
    // Patolojik Evre
    if (staging !== 'TXNX') {
      reportParts.push('PATOLOJİK EVRE (AJCC 8. EDİSYON):');
      reportParts.push(staging);
      reportParts.push('');
    }
    
    // Blok Tanımlama
    if (formData.blockIdentification) {
      reportParts.push('BLOK TANIMLAMA:');
      reportParts.push(formData.blockIdentification);
    }
    
    return reportParts.filter(part => part !== '').join('\n');
  };

  // Metin çeviri fonksiyonları
  const getOperativeProcedureText = (value) => {
    const procedures = {
      'not_specified': 'Belirtilmemiş',
      'nephroureterectomy': 'Nefroureterektomi',
      'ureterectomy_partial': 'Kısmi Üreterektomi',
      'ureterectomy_complete': 'Tam Üreterektomi',
      'ureterectomy_cystectomy': 'Sistektomi ile Üreterektomi',
      'ureterectomy_cystoprostatectomy': 'Sistoprostatektomi ile Üreterektomi',
      'other': 'Diğer'
    };
    return procedures[value] || value;
  };

  const getPreviousTherapyText = (value) => {
    const therapies = {
      'none': 'Önceki tedavi yok',
      'bcg': 'Bacillus Calmette-Guerin (BCG)',
      'intravesical_chemo': 'İntravezical kemoterapi',
      'systemic_chemo': 'Sistemik kemoterapi',
      'radiation': 'Radyoterapi',
      'other': 'Diğer'
    };
    return therapies[value] || value;
  };

  const getTumourFocalityText = (value) => {
    const focality = {
      'unifocal': 'Tek odaklı',
      'multifocal': 'Çok odaklı',
      'cannot_assess': 'Değerlendirilemez'
    };
    return focality[value] || value;
  };

  const getMacroscopicSiteText = (value) => {
    const sites = {
      'indeterminate': 'Belirsiz',
      'no_visible': 'Makroskopik görünür tümör yok',
      'ureter': 'Üreter',
      'renal_pelvis': 'Böbrek pelvisi',
      'other': 'Diğer'
    };
    return sites[value] || value;
  };

  const getMacroscopicInvasionText = (value) => {
    const invasions = {
      'cannot_assess': 'Değerlendirilemez',
      'no_visible': 'Makroskopik görünür tümör yok',
      'non_invasive': 'Non-invaziv tümör görünür',
      'wall_invasion': 'Duvar invazyonu',
      'periureteral_invasion': 'Periüreteral/peripelvic doku invazyonu',
      'renal_stroma': 'Böbrek stroması invazyonu',
      'perinephric_fat': 'Perinefrik yağ invazyonu',
      'adjacent_structures': 'Komşu yapı tutulumu'
    };
    return invasions[value] || value;
  };

  const getHistologicalTypeText = (value) => {
    const types = {
      'urothelial': 'Ürotelyal karsinom',
      'squamous': 'Skuamöz hücreli karsinom',
      'adenocarcinoma': 'Adenokarsinom',
      'mullerian': 'Müllerian tip tümörler',
      'clear_cell': 'Berrak hücreli karsinom',
      'endometrioid': 'Endometrioid karsinom',
      'neuroendocrine': 'Nöroendokrin tümör',
      'small_cell': 'Küçük hücreli nöroendokrin karsinom',
      'large_cell': 'Büyük hücreli nöroendokrin karsinom',
      'other': 'Diğer'
    };
    return types[value] || value;
  };

  const getHistologicalGradeText = (value) => {
    const grades = {
      'not_applicable': 'Uygulanamaz',
      'low_grade': 'Düşük derece',
      'high_grade': 'Yüksek derece',
      'g1': 'G1: İyi diferansiye',
      'g2': 'G2: Orta diferansiye',
      'g3': 'G3: Az diferansiye',
      'gx': 'GX: Değerlendirilemez'
    };
    return grades[value] || value;
  };

  const getMicroscopicInvasionText = (value) => {
    const invasions = {
      'cannot_assess': 'Değerlendirilemez',
      'no_evidence': 'Primer tümör kanıtı yok',
      'papillary_non_invasive': 'Papiller karsinom, non-invaziv',
      'carcinoma_in_situ': 'Karsinoma in situ, düz',
      'lamina_propria': 'Lamina propria invazyonu',
      'muscularis_propria': 'Muskularis propria invazyonu',
      'peripelvic_fat': 'Periüreteral veya peripelvic yağ invazyonu',
      'renal_stroma': 'Böbrek stroması invazyonu',
      'perinephric_fat': 'Perinefrik yağ invazyonu',
      'adjacent_structures': 'Komşu yapı invazyonu'
    };
    return invasions[value] || value;
  };

  const getNonInvasiveCarcinomaText = (value) => {
    const carcinomas = {
      'not_identified': 'Saptanmadı',
      'cis_flat': 'Karsinoma in situ, düz',
      'papillary_non_invasive': 'Papiller karsinom, non-invaziv',
      'other': 'Diğer'
    };
    return carcinomas[value] || value;
  };

  const getLymphovascularInvasionText = (value) => {
    const invasion = {
      'not_identified': 'Saptanmadı',
      'present': 'Mevcut',
      'indeterminate': 'Belirsiz'
    };
    return invasion[value] || value;
  };

  const getMarginStatusText = (value) => {
    const status = {
      'cannot_assess': 'Değerlendirilemez',
      'not_involved': 'Tutulum yok',
      'involved': 'Tutulum var'
    };
    return status[value] || value;
  };

  const getMarginDetailText = (value) => {
    const details = {
      'distal': 'Distal',
      'proximal': 'Proksimal',
      'soft_tissue': 'Yumuşak doku',
      'distal_mucosal': 'Distal müköz',
      'proximal_mucosal': 'Proksimal müköz'
    };
    return details[value] || value;
  };

  const getLymphNodeStatusText = (value) => {
    const status = {
      'not_submitted': 'Lenf nodu gönderilmedi',
      'not_involved': 'Tutulum yok',
      'involved': 'Tutulum var'
    };
    return status[value] || value;
  };

  const getExtranodal = (value) => {
    const extranodal = {
      'present': 'Mevcut',
      'not_identified': 'Saptanmadı'
    };
    return extranodal[value] || value;
  };

  const copyReport = () => {
    navigator.clipboard.writeText(generateReport());
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const InfoPopup = ({ title, content, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <div className="p-4 text-sm text-gray-700">
          {content}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 z-50">
          <Check size={16} />
          Rapor kopyalandı
        </div>
      )}

      {/* Info Popup */}
      {activePopup && (
        <InfoPopup 
          title={activePopup.title}
          content={activePopup.content}
          onClose={() => setActivePopup(null)}
        />
      )}

      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Böbrek Pelvisi ve Üreter Karsinom Patoloji Raporlama Sistemi
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol ve Orta Sütun - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hasta Bilgileri */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hasta Bilgileri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Hasta Adı Soyadı"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.patientName}
                  onChange={(e) => setFormData(prev => ({...prev, patientName: e.target.value}))}
                />
                <input
                  type="text"
                  placeholder="Hasta Numarası"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.patientId}
                  onChange={(e) => setFormData(prev => ({...prev, patientId: e.target.value}))}
                />
                <input
                  type="date"
                  placeholder="Doğum Tarihi"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({...prev, dateOfBirth: e.target.value}))}
                />
                <input
                  type="date"
                  placeholder="Talep Tarihi"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.dateOfRequest}
                  onChange={(e) => setFormData(prev => ({...prev, dateOfRequest: e.target.value}))}
                />
                <input
                  type="text"
                  placeholder="Laboratuvar Numarası"
                  className="md:col-span-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.accessionNumber}
                  onChange={(e) => setFormData(prev => ({...prev, accessionNumber: e.target.value}))}
                />
              </div>
            </div>

            {/* Klinik Bilgiler */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Klinik Bilgiler</h2>
              <div className="space-y-4">
                <textarea
                  placeholder="Klinik geçmiş ve önceki ürolojik hastalık öyküsü"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  value={formData.clinicalHistory}
                  onChange={(e) => setFormData(prev => ({...prev, clinicalHistory: e.target.value}))}
                />
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Önceki Tedaviler:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      {value: 'none', label: 'Önceki tedavi yok'},
                      {value: 'bcg', label: 'BCG'},
                      {value: 'intravesical_chemo', label: 'İntravezical kemoterapi'},
                      {value: 'systemic_chemo', label: 'Sistemik kemoterapi'},
                      {value: 'radiation', label: 'Radyoterapi'},
                      {value: 'other', label: 'Diğer'}
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleMultiSelect('previousTherapy', option.value)}
                        className={`p-2 text-left border rounded-lg transition-colors text-sm ${
                          formData.previousTherapy.includes(option.value)
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <textarea
                  placeholder="Diğer klinik bilgiler"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                  value={formData.otherClinicalInfo}
                  onChange={(e) => setFormData(prev => ({...prev, otherClinicalInfo: e.target.value}))}
                />
              </div>
            </div>

            {/* Ameliyat Yöntemi */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Ameliyat Yöntemi</h2>
                <span className="text-red-500 text-sm">*</span>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Ameliyat Yöntemi',
                    content: 'Gerçekleştirilen spesifik cerrahi prosedürün dokumentasyonu patololoji raporunun standart bir parçası olmalıdır. "Kısmi" terimi tüm üreterin çıkarılmadığı durumları ifade eder.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  {value: 'nephroureterectomy', label: 'Nefroureterektomi'},
                  {value: 'ureterectomy_partial', label: 'Kısmi Üreterektomi'},
                  {value: 'ureterectomy_complete', label: 'Tam Üreterektomi'},
                  {value: 'ureterectomy_cystectomy', label: 'Sistektomi ile Üreterektomi'},
                  {value: 'ureterectomy_cystoprostatectomy', label: 'Sistoprostatektomi ile Üreterektomi'},
                  {value: 'other', label: 'Diğer'},
                  {value: 'not_specified', label: 'Belirtilmemiş'}
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFormData(prev => ({...prev, operativeProcedure: option.value}))}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      formData.operativeProcedure === option.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ek Örnekler */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Ek Örnekler</h2>
                <span className="text-red-500 text-sm">*</span>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  {[
                    {value: 'not_submitted', label: 'Gönderilmedi'},
                    {value: 'submitted', label: 'Gönderildi'}
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFormData(prev => ({...prev, additionalSpecimens: option.value}))}
                      className={`w-full p-3 text-left border rounded-lg transition-colors ${
                        formData.additionalSpecimens === option.value
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                {formData.additionalSpecimens === 'submitted' && (
                  <textarea
                    placeholder="Ek örneklerin detayları"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    value={formData.additionalSpecimensDetails}
                    onChange={(e) => setFormData(prev => ({...prev, additionalSpecimensDetails: e.target.value}))}
                  />
                )}
              </div>
            </div>

            {/* Tümör Odak Sayısı */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Tümör Odak Sayısı</h2>
                <span className="text-red-500 text-sm">*</span>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Tümör Odak Sayısı',
                    content: 'Tümör multifokalitesi sonraki intravezical tümör gelişimi için önemli bir prediktördür. Meta-analizlerde multifokalite, tümör lokalizasyonu (üreter), pT evre ve tümör nekrozu intravezical rekürrens riskini artıran faktörler olarak saptanmıştır.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  {value: 'unifocal', label: 'Tek odaklı'},
                  {value: 'multifocal', label: 'Çok odaklı'},
                  {value: 'cannot_assess', label: 'Değerlendirilemez'}
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFormData(prev => ({...prev, tumourFocality: option.value}))}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      formData.tumourFocality === option.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tümör Boyutu */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Maksimum Tümör Boyutu</h2>
                <span className="text-red-500 text-sm">*</span>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Tümör Boyutu',
                    content: 'Tümör boyutu üst üriner sistem tümörlerinde cerrahi öncesi prognostik faktördür. Küçük tümörler (<1 cm) düşük riskli hastalık tanımının bir parçasıdır.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Boyut (mm)"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.maxTumourDimension}
                    onChange={(e) => setFormData(prev => ({...prev, maxTumourDimension: e.target.value}))}
                  />
                  <span className="text-gray-600">mm</span>
                </div>
                <input
                  type="text"
                  placeholder="Diğer boyutlar (opsiyonel) - örn: 15x12x8 mm"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.additionalDimensions}
                  onChange={(e) => setFormData(prev => ({...prev, additionalDimensions: e.target.value}))}
                />
              </div>
            </div>

            {/* Makroskopik Tümör Yerleşimi */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Makroskopik Tümör Yerleşimi</h2>
                <span className="text-red-500 text-sm">*</span>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Tümör Yerleşimi',
                    content: 'Tümör lokalizasyonu prognostik öneme sahiptir. Üreter yerleşimli tümörler böbrek pelvisi yerleşimli tümörlere göre daha kötü prognoza sahiptir. Alt üreter lokalizasyonu üst üreter lokalizasyonuna göre daha yüksek risk taşır.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">Uygun olanların tümünü seçin:</p>
                {[
                  {value: 'renal_pelvis', label: 'Böbrek pelvisi'},
                  {value: 'ureter', label: 'Üreter'},
                  {value: 'indeterminate', label: 'Belirsiz'},
                  {value: 'no_visible', label: 'Makroskopik görünür tümör yok'},
                  {value: 'other', label: 'Diğer'}
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleMultiSelect('macroscopicSite', option.value)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      formData.macroscopicSite.includes(option.value)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Makroskopik İnvazyon Yaygınlığı */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Makroskopik İnvazyon Yaygınlığı</h2>
                <span className="text-red-500 text-sm">*</span>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Makroskopik İnvazyon',
                    content: 'Mesane karsinomunun aksine, üst üriner sistem tümörlerinde tümör yaygınlığının gross değerlendirmesi patolojik evreleme sisteminin bir elemanı değildir. Ancak blok seçiminde ve mikroskopik bulgularla arasında uyumsuzluk olduğunda yardımcı olur.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">Uygun olanların tümünü seçin:</p>
                {[
                  {value: 'cannot_assess', label: 'Değerlendirilemez'},
                  {value: 'no_visible', label: 'Makroskopik görünür tümör yok'},
                  {value: 'non_invasive', label: 'Non-invaziv tümör görünür'},
                  {value: 'wall_invasion', label: 'Duvar invazyonu'},
                  {value: 'periureteral_invasion', label: 'Periüreteral/peripelvic doku invazyonu'},
                  {value: 'renal_stroma', label: 'Böbrek stroması invazyonu'},
                  {value: 'perinephric_fat', label: 'Perinefrik yağ invazyonu'},
                  {value: 'adjacent_structures', label: 'Komşu yapı tutulumu'}
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleMultiSelect('macroscopicInvasion', option.value)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      formData.macroscopicInvasion.includes(option.value)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Histolojik Tümör Tipi */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Histolojik Tümör Tipi</h2>
                <span className="text-red-500 text-sm">*</span>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Histolojik Tip',
                    content: 'Üst üriner sistem primer karsinomlarının çoğunluğu ürotelyal karsinomdur. Non-ürotelyal karsinomlar yaklaşık %2 oranındadır. WHO 2016 sınıflaması kullanılır.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  {value: 'urothelial', label: 'Ürotelyal karsinom'},
                  {value: 'squamous', label: 'Skuamöz hücreli karsinom'},
                  {value: 'adenocarcinoma', label: 'Adenokarsinom'},
                  {value: 'mullerian', label: 'Müllerian tip tümörler'},
                  {value: 'clear_cell', label: 'Berrak hücreli karsinom'},
                  {value: 'endometrioid', label: 'Endometrioid karsinom'},
                  {value: 'neuroendocrine', label: 'Nöroendokrin tümör'},
                  {value: 'small_cell', label: 'Küçük hücreli nöroendokrin karsinom'},
                  {value: 'large_cell', label: 'Büyük hücreli nöroendokrin karsinom'},
                  {value: 'other', label: 'Diğer'}
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFormData(prev => ({...prev, histologicalType: option.value}))}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      formData.histologicalType === option.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {formData.histologicalType === 'urothelial' && (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Alt tip/varyant (opsiyonel) - örn: skuamöz diferansiyasyon"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.histologicalSubtype}
                    onChange={(e) => setFormData(prev => ({...prev, histologicalSubtype: e.target.value}))}
                  />
                  {formData.histologicalSubtype && (
                    <input
                      type="number"
                      placeholder="Varyant yüzdesi (opsiyonel)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.histologicalSubtypePercentage}
                      onChange={(e) => setFormData(prev => ({...prev, histologicalSubtypePercentage: e.target.value}))}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Histolojik Derece */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Histolojik Tümör Derecesi</h2>
                <span className="text-red-500 text-sm">*</span>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Histolojik Derece',
                    content: 'Ürotelyal tümörlerin histolojik derecelendirmesi non-invaziv papiller tümörler ve invaziv karsinom olarak iki kategoridedir. WHO 2016 sınıflaması kullanılır.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Ürotelyal Karsinom:</h3>
                {[
                  {value: 'low_grade', label: 'Düşük derece'},
                  {value: 'high_grade', label: 'Yüksek derece'}
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFormData(prev => ({...prev, histologicalGrade: option.value}))}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      formData.histologicalGrade === option.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                
                <h3 className="text-sm font-medium text-gray-700 mb-2 mt-4">Skuamöz/Adenokarsinom:</h3>
                {[
                  {value: 'g1', label: 'G1: İyi diferansiye'},
                  {value: 'g2', label: 'G2: Orta diferansiye'},
                  {value: 'g3', label: 'G3: Az diferansiye'},
                  {value: 'gx', label: 'GX: Değerlendirilemez'}
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFormData(prev => ({...prev, histologicalGrade: option.value}))}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      formData.histologicalGrade === option.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                
                <button
                  onClick={() => setFormData(prev => ({...prev, histologicalGrade: 'not_applicable'}))}
                  className={`w-full p-3 text-left border rounded-lg transition-colors ${
                    formData.histologicalGrade === 'not_applicable'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Uygulanamaz
                </button>
              </div>
            </div>

            {/* Mikroskopik İnvazyon Yaygınlığı */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Mikroskopik İnvazyon Yaygınlığı</h2>
                <span className="text-red-500 text-sm">*</span>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Mikroskopik İnvazyon',
                    content: 'Patolojik evre ameliyat sonrası önemli bir prognostik göstergedir. T2 hastalık için herhangi bir düz kas invazyonu muskularis propria invazyonu olarak kabul edilir.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">Uygun olanların tümünü seçin:</p>
                {[
                  {value: 'no_evidence', label: 'Primer tümör kanıtı yok'},
                  {value: 'papillary_non_invasive', label: 'Papiller karsinom, non-invaziv'},
                  {value: 'carcinoma_in_situ', label: 'Karsinoma in situ, düz'},
                  {value: 'lamina_propria', label: 'Subepitelyal bağ dokusu (lamina propria) invazyonu'},
                  {value: 'muscularis_propria', label: 'Muskularis propria invazyonu'},
                  {value: 'peripelvic_fat', label: 'Periüreteral/peripelvic (böbrek sinüsü) yağ invazyonu'},
                  {value: 'renal_stroma', label: 'Böbrek stroması invazyonu'},
                  {value: 'perinephric_fat', label: 'Böbrek boyunca perinefrik yağ invazyonu'},
                  {value: 'adjacent_structures', label: 'Komşu yapı invazyonu'},
                  {value: 'cannot_assess', label: 'Değerlendirilemez'}
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleMultiSelect('microscopicInvasion', option.value)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      formData.microscopicInvasion.includes(option.value)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Non-invaziv Karsinom */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Non-invaziv Karsinom</h2>
                <span className="text-red-500 text-sm">*</span>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Non-invaziv Karsinom',
                    content: 'Eşlik eden ürotelyal CIS varlığı daha kötü nüks-free ve kansere özgü sağkalım ile ilişkilidir. Bu nedenle numunelerde makroskopik normal görünen üreter ve böbrek pelvisi bölümlerinin değerlendirilmesi önemlidir.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">Uygun olanların tümünü seçin:</p>
                {[
                  {value: 'not_identified', label: 'Saptanmadı'},
                  {value: 'cis_flat', label: 'Karsinoma in situ, düz'},
                  {value: 'papillary_non_invasive', label: 'Papiller karsinom, non-invaziv'},
                  {value: 'other', label: 'Diğer'}
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleMultiSelect('nonInvasiveCarcinoma', option.value)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      formData.nonInvasiveCarcinoma.includes(option.value)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {(formData.nonInvasiveCarcinoma.includes('cis_flat') || formData.nonInvasiveCarcinoma.includes('papillary_non_invasive')) && (
                <div className="mt-4">
                  <p className="text-sm text-gray-700 mb-2">Yaygınlık:</p>
                  <div className="space-y-2">
                    {[
                      {value: 'focal', label: 'Fokal (tek blok)'},
                      {value: 'multifocal', label: 'Multifokal (çoklu blok)'},
                      {value: 'indeterminate', label: 'Belirsiz'}
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setFormData(prev => ({...prev, nonInvasiveExtent: option.value}))}
                        className={`w-full p-3 text-left border rounded-lg transition-colors ${
                          formData.nonInvasiveExtent === option.value
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Eşlik Eden Epitelyal Lezyonlar */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Eşlik Eden Epitelyal Lezyonlar</h2>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Eşlik Eden Lezyonlar',
                    content: 'Karsinom tanısı olmayan çeşitli neoplastik lezyonlar üriner sistemde tanınır. Bunlar papiller lezyonlar (ürotelyal papillom, PUNLMP, ters papillom) ve düz lezyonlar (ürotelyal displazi, keratinize skuamöz metaplazi, intestinal metaplazi) olabilir.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  {[
                    {value: 'not_identified', label: 'Saptanmadı'},
                    {value: 'present', label: 'Mevcut'}
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFormData(prev => ({...prev, associatedLesions: option.value}))}
                      className={`w-full p-3 text-left border rounded-lg transition-colors ${
                        formData.associatedLesions === option.value
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                {formData.associatedLesions === 'present' && (
                  <textarea
                    placeholder="Eşlik eden lezyonların detayları (örn: ürotelyal displazi, keratinize skuamöz metaplazi)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    value={formData.associatedLesionsDetails}
                    onChange={(e) => setFormData(prev => ({...prev, associatedLesionsDetails: e.target.value}))}
                  />
                )}
              </div>
            </div>

            {/* Lenfovasküler İnvazyon */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Lenfovasküler İnvazyon</h2>
                <span className="text-red-500 text-sm">*</span>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Lenfovasküler İnvazyon',
                    content: 'Lenfovasküler invazyon üst üriner sistem ürotelyal karsinomlarında önemli bir prognostik gösterge olarak tekrar tekrar bulunmuştur. EAU kılavuzlarında bağımsız bir outcome prediktörü olduğu sonucuna varılmıştır.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  {value: 'not_identified', label: 'Saptanmadı'},
                  {value: 'present', label: 'Mevcut'},
                  {value: 'indeterminate', label: 'Belirsiz'}
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFormData(prev => ({...prev, lymphovascularInvasion: option.value}))}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      formData.lymphovascularInvasion === option.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cerrahi Sınır Durumu */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Cerrahi Sınır Durumu</h2>
                <span className="text-red-500 text-sm">*</span>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Cerrahi Sınır',
                    content: 'Pozitif cerrahi sınırlar (genellikle nefroureterektomi serilerinde mesane kuff) sonraki intravezical tümör gelişimi riski ile korele bulunmuştur. Ayrıca uzak metastaz riski ve kansere özgü sağkalım ile de ilişkilidir.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  {value: 'cannot_assess', label: 'Değerlendirilemez'},
                  {value: 'not_involved', label: 'Tutulum yok'},
                  {value: 'involved', label: 'Tutulum var'}
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFormData(prev => ({...prev, marginStatus: option.value}))}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      formData.marginStatus === option.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              {formData.marginStatus === 'involved' && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">İnvaziv karsinom sınırları:</p>
                  <div className="space-y-2">
                    {[
                      {value: 'distal', label: 'Distal'},
                      {value: 'proximal', label: 'Proksimal'},
                      {value: 'soft_tissue', label: 'Yumuşak doku'}
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleMultiSelect('marginDetails', option.value)}
                        className={`w-full p-3 text-left border rounded-lg transition-colors ${
                          formData.marginDetails.includes(option.value)
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-sm font-medium text-gray-700 mb-2 mt-4">CIS/Non-invaziv yüksek derece ürotelyal karsinom:</p>
                  <div className="space-y-2">
                    {[
                      {value: 'distal_mucosal', label: 'Distal müköz'},
                      {value: 'proximal_mucosal', label: 'Proksimal müköz'}
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleMultiSelect('marginDetails', option.value)}
                        className={`w-full p-3 text-left border rounded-lg transition-colors ${
                          formData.marginDetails.includes(option.value)
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bölgesel Lenf Nodu Durumu */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Bölgesel Lenf Nodu Durumu</h2>
                <span className="text-red-500 text-sm">*</span>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Lenf Nodu Durumu',
                    content: 'Böbrek pelvisi ve üreter tümörlerinin evreleme sistemi, pN kategorisini belirlerken hem tutulu lenf nodu sayısını hem de metastazların boyutunu içerir. 2 cm kesim noktası kullanılır.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {[
                  {value: 'not_submitted', label: 'Bölgesel lenf nodu gönderilmedi'},
                  {value: 'not_involved', label: 'Tutulum yok'},
                  {value: 'involved', label: 'Tutulum var'}
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFormData(prev => ({...prev, lymphNodeStatus: option.value}))}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      formData.lymphNodeStatus === option.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              {(formData.lymphNodeStatus === 'not_involved' || formData.lymphNodeStatus === 'involved') && (
                <div className="mt-4 space-y-3">
                  <input
                    type="number"
                    placeholder="İncelenen lenf nodu sayısı"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.lymphNodesExamined}
                    onChange={(e) => setFormData(prev => ({...prev, lymphNodesExamined: e.target.value}))}
                  />
                </div>
              )}
              
              {formData.lymphNodeStatus === 'involved' && (
                <div className="mt-4 space-y-3">
                  <input
                    type="number"
                    placeholder="Pozitif lenf nodu sayısı"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.positiveLymphNodes}
                    onChange={(e) => setFormData(prev => ({...prev, positiveLymphNodes: e.target.value}))}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="En büyük metastaz boyutu"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.largestMetastasis}
                      onChange={(e) => setFormData(prev => ({...prev, largestMetastasis: e.target.value}))}
                    />
                    <span className="text-gray-600">mm</span>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Tutulu lenf nodu lokalizasyonu"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.lymphNodeLocation}
                    onChange={(e) => setFormData(prev => ({...prev, lymphNodeLocation: e.target.value}))}
                  />
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Ekstranodal yayılım:</p>
                    <div className="space-y-2">
                      {[
                        {value: 'present', label: 'Mevcut'},
                        {value: 'not_identified', label: 'Saptanmadı'}
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => setFormData(prev => ({...prev, extranodal: option.value}))}
                          className={`w-full p-3 text-left border rounded-lg transition-colors ${
                            formData.extranodal === option.value
                              ? 'bg-blue-50 border-blue-500 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Eşlik Eden Patoloji */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Eşlik Eden Patoloji</h2>
                <span className="text-red-500 text-sm">*</span>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Eşlik Eden Patoloji',
                    content: 'Nefrektomi örneklerindeki non-neoplastik böbrek dokusunda tıbbi böbrek hastalıklarının mevcut olabileceğini tanımak önemlidir. Nefroureterektomi örneklerinde de benzer bulgular olabilir.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <textarea
                  placeholder="Eşlik eden patolojik bulgular"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  value={formData.coexistentPathology}
                  onChange={(e) => setFormData(prev => ({...prev, coexistentPathology: e.target.value}))}
                />
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Non-neoplastik böbrek dokusu:</p>
                  <textarea
                    placeholder="Non-neoplastik böbrek dokusundaki bulgular"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    value={formData.nonNeoplasticRenal}
                    onChange={(e) => setFormData(prev => ({...prev, nonNeoplasticRenal: e.target.value}))}
                  />
                </div>
              </div>
            </div>

            {/* Yardımcı Çalışmalar */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Yardımcı Çalışmalar</h2>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Yardımcı Çalışmalar',
                    content: 'İmmünohistokimya, moleküler çalışmalar ve Lynch sendromu değerlendirmesi gibi yardımcı çalışmalar. Herediter Nonpolipozis Kolorektal Kanser (HNPCC) değerlendirmesi önerilir.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  {[
                    {value: 'not_performed', label: 'Yapılmadı'},
                    {value: 'performed', label: 'Yapıldı'}
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFormData(prev => ({...prev, ancillaryStudies: option.value}))}
                      className={`w-full p-3 text-left border rounded-lg transition-colors ${
                        formData.ancillaryStudies === option.value
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                {formData.ancillaryStudies === 'performed' && (
                  <textarea
                    placeholder="İmmünohistokimya, moleküler çalışmalar vb. detayları"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    value={formData.ancillaryStudiesDetails}
                    onChange={(e) => setFormData(prev => ({...prev, ancillaryStudiesDetails: e.target.value}))}
                  />
                )}
              </div>
            </div>

            {/* Uzak Metastaz */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Histolojik Olarak Doğrulanmış Uzak Metastazlar</h2>
                <span className="text-red-500 text-sm">*</span>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  {[
                    {value: 'not_identified', label: 'Saptanmadı'},
                    {value: 'indeterminate', label: 'Belirsiz'},
                    {value: 'present', label: 'Mevcut'}
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFormData(prev => ({...prev, distantMetastases: option.value}))}
                      className={`w-full p-3 text-left border rounded-lg transition-colors ${
                        formData.distantMetastases === option.value
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                {formData.distantMetastases === 'present' && (
                  <textarea
                    placeholder="Metastaz yerleşimi ve detayları"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    value={formData.distantMetastasesDetails}
                    onChange={(e) => setFormData(prev => ({...prev, distantMetastasesDetails: e.target.value}))}
                  />
                )}
              </div>
            </div>

            {/* TNM Descriptors */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">TNM Tanımlayıcıları</h2>
                <button 
                  onClick={() => setActivePopup({
                    title: 'TNM Tanımlayıcıları',
                    content: 'm = multiple primary tumours (çoklu primer tümörler), r = recurrent (rekürrens), y = post-therapy (tedavi sonrası). Sadece uygulanabilir durumlarda kullanılır.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">Uygun olanları seçin:</p>
                {[
                  {value: 'm', label: 'm - Çoklu primer tümörler'},
                  {value: 'r', label: 'r - Rekürrens'},
                  {value: 'y', label: 'y - Tedavi sonrası'}
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleMultiSelect('tnmDescriptors', option.value)}
                    className={`w-full p-3 text-left border rounded-lg transition-colors ${
                      formData.tnmDescriptors.includes(option.value)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Blok Tanımlama */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Blok Tanımlama Anahtarı</h2>
                <button 
                  onClick={() => setActivePopup({
                    title: 'Blok Tanımlama',
                    content: 'Tüm doku bloklarının kökeninin/tanımlamasının kaydedilmesi ve final patoloji raporunda dokümante edilmesi tercih edilir. İç veya dış değerlendirme ihtiyacı durumunda önemlidir.'
                  })}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info size={16} />
                </button>
              </div>
              <textarea
                placeholder="Tüm doku bloklarının doğası ve orijininin listesi"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                value={formData.blockIdentification}
                onChange={(e) => setFormData(prev => ({...prev, blockIdentification: e.target.value}))}
              />
            </div>
          </div>

          {/* Sağ Sütun - Rapor Önizleme */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Rapor Önizleme</h2>
                <button
                  onClick={copyReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Copy size={16} />
                  Raporu Kopyala
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 min-h-96 max-h-screen overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                  {generateReport()}
                </pre>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  <strong>Önerilen Patolojik Evre:</strong> {calculateStaging()}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  AJCC 8. Edisyon TNM sınıflamasına göre
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathologyReportSystem;
