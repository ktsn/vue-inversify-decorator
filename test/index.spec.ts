import 'reflect-metadata'
import 'es6-map/implement'
import * as assert from 'power-assert'
import Vue from 'vue'
import Component from 'vue-class-component'
import { Container, injectable } from 'inversify'
import { Provide, Inject } from '../src/index'

Vue.config.productionTip = false

describe('Inject decorator', () => {

  @injectable()
  class Katana {
    public hit() {
      return 'cut!'
    }
  }

  @injectable()
  class Shuriken {
    public throw() {
      return 'hit!'
    }
  }

  @injectable()
  class Ninja {
    private _katana: Katana
    private _shuriken: Shuriken

    public constructor(katana: Katana, shuriken: Shuriken) {
      this._katana = katana
      this._shuriken = shuriken
    }

    public fight() { return this._katana.hit() }
    public sneak() { return this._shuriken.throw() }
  }

  const container = new Container()
  container.bind<Ninja>(Ninja).toSelf()
  container.bind<Katana>(Katana).toSelf()
  container.bind<Shuriken>(Shuriken).toSelf()

  it('should inject dependencies', () => {
    @Component({
      template: `
        <p>{{ ninja.fight() }}</p>
      `
    })
    class Child extends Vue {
      @Inject() ninja: Ninja
    }

    @Component({
      components: {
        Child
      },
      template: `
        <child></child>
      `
    })
    @Provide(container)
    class App extends Vue {}

    const vm = new App().$mount()
    assert(vm.$el.textContent === 'cut!')
  })
})
