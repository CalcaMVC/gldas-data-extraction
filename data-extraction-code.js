// Coordenadas geográficas da Estação Meteorológica Lageado (EML).
var EML = ee.Geometry.Point(-48.43161438702039, -22.846642690036003);

// Conjunto de dados do GLDAS.
var GLDAS = ee.ImageCollection('NASA/GLDAS/V021/NOAH/G025/T3H').filterDate('2020-01-01', '2022-12-31');

// Função para converter de UTC para o fuso-horário de São Paulo (UTC-3).
var toSPTime = function(image) {
  return image.updateMask(image)
    .set('system:time_start', ee.Date(image.get('system:time_start')).advance(-3, 'hour'));
};

// Aplica a função de conversão para cada imagem na coleção DO GLDAS.
var GLDAS_SPTime = GLDAS.map(toSPTime);

// Extrai a irradiância solar de ondas curtas.
var IRSOL = GLDAS_SPTime.select('SWdown_f_tavg');

// Função para converter data e hora em formato legível.
var formatDateTime = function(image) {
  var date = ee.Date(image.get('system:time_start'));
  return image.set({
    'date': date.format('dd/MM/yyyy'),
    'time': date.format('HH:mm'),
    'SWdown_f_tavg': image.select('SWdown_f_tavg').reduceRegion(ee.Reducer.first(), EML).get('SWdown_f_tavg')
  });
};

// Aplica a função de formatação para cada imagem na coleção do GLDAS.
var formattedData = IRSOL.map(formatDateTime);

// Exporta para CSV no Google Drive.
Export.table.toDrive({
  collection: formattedData,
  description: 'GLDAS-20a23',
  fileFormat: 'CSV',
  selectors: ['date', 'time', 'SWdown_f_tavg'],
  folder: 'Arquivo Google'
});
