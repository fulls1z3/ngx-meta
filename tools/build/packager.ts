// libs
import { ngPackagr } from 'ng-packagr';

// module
import { root } from './helpers';

ngPackagr()
  .forProject(root(`./packages/@ngx-meta/${process.argv[2]}/package.json`))
  .withTsConfig(root('./tools/build/tsconfig.package.json'))
  .build()
  .catch(() => process.exitCode = 1);
