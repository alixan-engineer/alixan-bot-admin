export const useSidebar = () => {
  const open = useState<boolean>('admin-sidebar', () => false);
  const show = () => { open.value = true; };
  const hide = () => { open.value = false; };
  const toggle = () => { open.value = !open.value; };
  return { open, show, hide, toggle };
};
