// BenitoTools: Organizza PDF — anteprime delle pagine, selezione, sposta/ruota/elimina/duplica/estrai.
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import { degrees, PDFDocument } from 'pdf-lib';
import { ToolComponentProps } from '@tools/defineTool';
import PdfShell from '../../../pdf/PdfShell';
import { usePt } from '../../../pdf/strings';
import { openPdfjs, pdfFile, thumbnail, withSuffix } from '../../../pdf/lib';

interface Pg {
  id: number;
  src: number | null; // null = pagina bianca
  rot: number;
}

let nextId = 1;

export default function OrganizePdf(_p: ToolComponentProps) {
  const pt = usePt();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<Pg[]>([]);
  const [thumbs, setThumbs] = useState<Record<number, string>>({});
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [dragId, setDragId] = useState<number | null>(null);

  useEffect(() => {
    setPages([]);
    setThumbs({});
    setSel(new Set());
    if (!file) return;
    let alive = true;
    (async () => {
      const pdf = await openPdfjs(file);
      const list = Array.from({ length: pdf.numPages }, (_, i) => ({ id: nextId++, src: i, rot: 0 }));
      setPages(list);
      for (let i = 0; i < pdf.numPages && alive; i++) {
        const t = await thumbnail(pdf, i + 1, 160);
        if (alive) setThumbs((p) => ({ ...p, [i]: t }));
      }
    })().catch(console.error);
    return () => {
      alive = false;
    };
  }, [file]);

  const selected = useMemo(() => pages.filter((p) => sel.has(p.id)), [pages, sel]);
  const toggle = (id: number) => {
    const s = new Set(sel);
    s.has(id) ? s.delete(id) : s.add(id);
    setSel(s);
  };

  const move = (dir: -1 | 1) => {
    const arr = [...pages];
    const order = dir === -1 ? arr.map((_, i) => i) : arr.map((_, i) => arr.length - 1 - i);
    for (const i of order) {
      const j = i + dir;
      if (sel.has(arr[i].id) && j >= 0 && j < arr.length && !sel.has(arr[j].id)) [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setPages(arr);
  };
  const rotate = () => setPages(pages.map((p) => (sel.has(p.id) ? { ...p, rot: (p.rot + 90) % 360 } : p)));
  const del = () => {
    setPages(pages.filter((p) => !sel.has(p.id)));
    setSel(new Set());
  };
  const dup = () => setPages(pages.flatMap((p) => (sel.has(p.id) ? [p, { ...p, id: nextId++ }] : [p])));
  const blank = () => {
    const out: Pg[] = [];
    pages.forEach((p) => {
      out.push(p);
      if (sel.has(p.id)) out.push({ id: nextId++, src: null, rot: 0 });
    });
    if (!sel.size) out.push({ id: nextId++, src: null, rot: 0 });
    setPages(out);
  };

  const build = async (list: Pg[], suffix: string) => {
    const src = await PDFDocument.load(await file!.arrayBuffer(), { ignoreEncryption: true });
    const out = await PDFDocument.create();
    const first = src.getPage(0).getSize();
    for (const p of list) {
      if (p.src === null) {
        out.addPage([first.width, first.height]);
        continue;
      }
      const [copy] = await out.copyPages(src, [p.src]);
      if (p.rot) copy.setRotation(degrees((copy.getRotation().angle + p.rot) % 360));
      out.addPage(copy);
    }
    return pdfFile(await out.save(), withSuffix(file!.name, suffix));
  };

  const onDrop = (targetId: number) => {
    if (dragId === null || dragId === targetId) return;
    const arr = [...pages];
    const from = arr.findIndex((p) => p.id === dragId);
    const [it] = arr.splice(from, 1);
    arr.splice(arr.findIndex((p) => p.id === targetId), 0, it);
    setPages(arr);
    setDragId(null);
  };

  const btn = (icon: string, label: string, onClick: () => void, disabled = !sel.size) => (
    <Tooltip title={label}>
      <span>
        <Button size="small" variant="outlined" disabled={disabled} onClick={onClick} startIcon={<Icon icon={icon} />}>
          {label}
        </Button>
      </span>
    </Tooltip>
  );

  return (
    <Box>
      <PdfShell
        file={file}
        setFile={setFile}
        run={async () => [await build(pages, 'organizzato')]}
        actionLabel={pt.org.save}
        actionIcon="material-symbols:save-outline-rounded"
        disabled={!pages.length}
        options={
          pages.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {pt.org.hint}
              </Typography>
              <Stack direction="row" gap={1} flexWrap="wrap" mb={1}>
                <Button size="small" onClick={() => setSel(sel.size === pages.length ? new Set() : new Set(pages.map((p) => p.id)))}>
                  {sel.size === pages.length ? pt.org.selectNone : pt.org.selectAll}
                </Button>
                <Typography variant="caption" alignSelf="center" color="text.secondary">
                  {sel.size} {pt.org.selected}
                </Typography>
              </Stack>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {btn('material-symbols:arrow-back-rounded', pt.org.left, () => move(-1))}
                {btn('material-symbols:arrow-forward-rounded', pt.org.right, () => move(1))}
                {btn('material-symbols:rotate-right-rounded', pt.org.rotate, rotate)}
                {btn('material-symbols:content-copy-outline-rounded', pt.org.dup, dup)}
                {btn('material-symbols:note-add-outline-rounded', pt.org.blank, blank, false)}
                {btn('material-symbols:delete-outline-rounded', pt.org.del, del)}
                {btn('material-symbols:swap-vert-rounded', pt.org.reverse, () => setPages([...pages].reverse()), false)}
                {btn('material-symbols:file-export-outline-rounded', pt.org.extract, async () => {
                  const f = await build(selected, 'estratto');
                  const { downloadFile } = await import('../../../share');
                  const { addToHistory } = await import('../../../history');
                  downloadFile(f, f.name);
                  addToHistory(f);
                })}
              </Stack>
            </Box>
          )
        }
        below={
          pages.length > 0 && (
            <Grid container spacing={1} mt={1}>
              {pages.map((p, i) => (
                <Grid item xs={4} sm={3} key={p.id}>
                  <Box
                    draggable
                    onDragStart={() => setDragId(p.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(p.id)}
                    onClick={() => toggle(p.id)}
                    sx={{
                      cursor: 'pointer',
                      border: 3,
                      borderColor: sel.has(p.id) ? 'primary.main' : 'transparent',
                      borderRadius: 2,
                      p: 0.5,
                      bgcolor: 'background.paper',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {p.src === null ? (
                        <Box sx={{ width: 80, height: 110, bgcolor: '#fff', border: '1px solid #ccc' }} />
                      ) : thumbs[p.src] ? (
                        <img src={thumbs[p.src]} alt="" style={{ maxWidth: '100%', maxHeight: 120, transform: `rotate(${p.rot}deg)`, boxShadow: '0 1px 4px rgba(0,0,0,.3)' }} />
                      ) : (
                        <Icon icon="eos-icons:loading" fontSize={28} />
                      )}
                    </Box>
                    <Typography variant="caption">{i + 1}</Typography>
                    {sel.has(p.id) && (
                      <IconButton size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'primary.main', color: 'white', width: 22, height: 22 }}>
                        <Icon icon="material-symbols:check-rounded" fontSize={16} />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          )
        }
      />
    </Box>
  );
}
