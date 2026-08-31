import './styles/launcher.css';

import { render } from 'preact';
import { TabControls } from './tab-controls';

render(<TabControls />, document.documentElement.appendChild(document.createElement('div')));
