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
    ];
    Promise.all(faces.map((f) => f.load())).then((fs) => { fs.forEach((f) => document.fonts.add(f)); return document.fonts.ready; }).then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};
