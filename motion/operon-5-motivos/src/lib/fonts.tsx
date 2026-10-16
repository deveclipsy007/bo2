// Fontes do kit embutidas (sem rede no render): Manrope (títulos), DM Sans (corpo), Gelasio itálico (ênfase, clone métrico da Georgia).
import {useLayoutEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

export const useFonts = () => {
  const [handle] = useState(() => delayRender('fontes'));
  useLayoutEffect(() => {
    const faces = [
      new FontFace('Manrope', `url(${staticFile('fonts/Manrope.woff2')})`, {weight: '200 800'}),
      new FontFace('DM Sans', `url(${staticFile('fonts/DMSans.woff2')})`, {weight: '100 900'}),
      new FontFace('Gelasio', `url(${staticFile('fonts/Gelasio-Italic.woff2')})`, {weight: '400', style: 'italic'}),
      new FontFace('Inter Tight', `url(${staticFile('fonts/InterTight-800.woff2')})`, {weight: '800'}),
      new FontFace('Inter Tight', `url(${staticFile('fonts/InterTight-900.woff2')})`, {weight: '900'}),
      new FontFace('Inter Tight', `url(${staticFile('fonts/InterTight-800-Italic.woff2')})`, {weight: '800', style: 'italic'}),
      new FontFace('Bodoni Moda', `url(${staticFile('fonts/BodoniModa-500.woff2')})`, {weight: '500'}),
      new FontFace('Syne', `url(${staticFile('fonts/Syne-700.woff2')})`, {weight: '700'}),
      new FontFace('Syne', `url(${staticFile('fonts/Syne-800.woff2')})`, {weight: '800'}),
      new FontFace('Instrument Serif', `url(${staticFile('fonts/InstrumentSerif.woff2')})`, {weight: '400'}),
      new FontFace('Instrument Serif', `url(${staticFile('fonts/InstrumentSerif-Italic.woff2')})`, {weight: '400', style: 'italic'}),
      new FontFace('Inter', `url(${staticFile('fonts/Inter-500.woff2')})`, {weight: '500'}),
      new FontFace('Inter', `url(${staticFile('fonts/Inter-600.woff2')})`, {weight: '600'}),
      new FontFace('Inter', `url(${staticFile('fonts/Inter-700.woff2')})`, {weight: '700'}),
      new FontFace('Bodoni Moda', `url(${staticFile('fonts/BodoniModa-400-Italic.woff2')})`, {weight: '400', style: 'italic'}),
      new FontFace('Bodoni Moda', `url(${staticFile('fonts/BodoniModa-700-Italic.woff2')})`, {weight: '700', style: 'italic'}),
    ];
    Promise.all(faces.map((f) => f.load())).then((fs) => { fs.forEach((f) => document.fonts.add(f)); return document.fonts.ready; }).then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};
