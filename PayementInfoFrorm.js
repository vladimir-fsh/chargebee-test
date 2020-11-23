import React, { useRef, useEffect, useCallback } from 'react'
import { useMutation } from 'react-apollo'
import get from 'lodash/fp/get'
import flow from 'lodash/fp/flow'
import isEqual from 'lodash/fp/isEqual'
import Form from 'UI/components/Form/Form'
import {
  createPaymentIntentMutation,
} from 'queries/shopQueries'
import { useBillingServiceProvider } from '../BillingServiceProvider'
import { usePaypal } from '../hooks/usePaypal'
import styles from './creditCardForm.scss'
import {
  CardComponent,
  CardNumber,
  CardExpiry,
  CardCVV,
} from '@chargebee/chargebee-js-react-wrapper'


export const PayementInfoFrorm = addLocale(
  ({ translate, innerRef }) => {
    const [runPaymentIntentMutation] = useMutation(createPaymentIntentMutation)
    const cardRef = useRef()
    const intent = useRef()
    // window.Chargebee
    const billingServiceProvider = useBillingServiceProvider()

    useEffect(() => {
      const initThreeDS = async () => {
        const response = await runPaymentIntentMutation()
        intent.current = flow(
          get([`data`, `createPaymentIntent`, `raw`]),
          JSON.parse,
        )(response)

        billingServiceProvider().init({
          site: `medicuja-test`,
          publishableKey: `test_Zq5LA0cdbyLpYcugwtvVtdoCMblKBmOKhE`,
        })
      }

      initThreeDS()
    }, [])

    const handleOnSubmit = useCallback(async () => {
      try {
        const authorizedPaymentIntent = await cardRef.current.authorizeWith3ds(
          intent.current,
        )

        console.log(`authorizedPaymentIntent`, authorizedPaymentIntent)
      } catch (error) {
        console.log(`error`, error)
      }
    }, [])

    return (
      <Form enableReinitialize onSubmit={handleOnSubmit} innerRef={innerRef}>
        {({ submitForm }) => (
          <React.Fragment>
            <CardComponent styles={styles} ref={cardRef}>
              <CardNumber
                placeholder={translate(`ShopPhrase.creditFormNumber`)}
                className={styles.input}
              />
              <CardExpiry
                className={styles.input}
                placeholder={translate(`ShopPhrase.creditFormYYMM`)}
              />
              <CardCVV
                className={styles.input}
                placeholder={translate(`ShopPhrase.creditFormCVV`)}
              />
            </CardComponent>

            <button onClick={submitForm} type="button">
              Submit by component
            </button>
          </React.Fragment>
        )}
      </Form>
    )
  },
)
