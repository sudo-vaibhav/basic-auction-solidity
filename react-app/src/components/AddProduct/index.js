import { useState } from "react"


const AddProduct = ({contract,account}) => {
    const [submitting, setSubmitting] = useState(false)
    
    const [productInfo, setProductInfo] = useState(() => {

        const fiveMinutesFromNow = new Date(Date.now()+5*60*1000)
        
        return {
            name: "My Soul",
            minPrice: 100,
            endTime: `${fiveMinutesFromNow.getFullYear()}-${`${fiveMinutesFromNow.getMonth() +
                1}`.padStart(2, 0)}-${`${fiveMinutesFromNow.getDate()}`.padStart(
                    2,
                    0
                )}T${`${fiveMinutesFromNow.getHours()}`.padStart(
                    2,
                    0
                )}:${`${fiveMinutesFromNow.getMinutes()}`.padStart(2, 0)}` // 5 minutes from now
        }
    })

    const handleChange = (e) => {
        const field = e.target.name
        setProductInfo(state => {
            return ({
                ...state,
                [field] : field === "minPrice" ? parseInt(e.target.value) : e.target.value
            })
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log("submitting product for auction")
        console.log(contract,account)
        try {
            
            setSubmitting(true)
            const { name,minPrice,endTime} = productInfo
            contract.methods?.addProduct(name, minPrice, new Date(endTime).getTime()).send({ from: account })
            .once('receipt', (receipt) => {
                console.log("transaction receipt received", receipt)
                setSubmitting(false)
                window.location.reload(false)
                setSubmitting(false)
            })
        }
        catch (err) {
            console.log("error while adding product", err)
            setSubmitting(false)
        }
    }

    console.log("current form fields value",productInfo)
    return <form onSubmit={ handleSubmit}>
        <h2>Add Product to Auction</h2>
        <fieldset>
        <label>Product Name</label>
            <input type="text" value={productInfo.name} name={ "name"} onChange={handleChange} />
            
        <label>Product Minimum Price (in Wei, atleast 100 Wei recommended)</label>
            <input type="number" value={productInfo.minPrice} name={ "minPrice"} onChange={handleChange} />
            <label>Auction End Time</label>
            <input type="datetime-local" value={productInfo.endTime} name={"endTime"} onChange={ handleChange}/>
    
            <button>{ submitting ? "Adding...":"Submit"}</button>
        </fieldset>
        </form>
}

export default AddProduct