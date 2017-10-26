import Vue, { ComponentOptions } from 'vue'
import { createDecorator } from 'vue-class-component'
import { Container, interfaces } from 'inversify'

interface ExtendedOptions extends ComponentOptions<Vue> {
  __container_injected__?: true
}

const containerKey = '__inversify_container__'

export const Provide = (container: Container): ClassDecorator => createDecorator(options => {
  options.mixins = options.mixins || []
  options.mixins.push({
    provide: {
      [containerKey]: container
    }
  })
})

export const Inject = (identifier?: interfaces.ServiceIdentifier<any>) => (proto: Vue, key: string) => {
  let Type: any
  if (typeof Reflect !== 'undefined' && typeof Reflect.getMetadata === 'function') {
    Type = Reflect.getMetadata('design:type', proto, key)
  }

  return createDecorator((options: ExtendedOptions, key) => {
    if (!options.__container_injected__) {
      options.mixins = options.mixins || []
      options.mixins.push({
        inject: [containerKey]
      })

      options.__container_injected__ = true
    }

    options.computed = options.computed || {}

    options.computed[key] = function(this: any) {
      return (this[containerKey] as Container).get(identifier || Type)
    }
  })(proto, key)
}
